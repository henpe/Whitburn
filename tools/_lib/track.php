<?php
    class Track {

        function __construct($song, $artist, $year) {

            $this->echonestKey = 'ZUDBPBLHIZ8VN23BR';
            $this->_7DigitalKey = '7d8p87g5dz8g';

            $this->song = $song;
            $this->artist = $artist;
            $this->year = $year;
        }

        function getTrackData() {
            $url = 'http://developer.echonest.com/api/v4/song/search?artist='.urlencode($this->artist).'&title='.urlencode($this->song).'&bucket=artist_familiarity&bucket=song_hotttnesss&bucket=artist_location&bucket=id:musicbrainz&bucket=id:7digital-US&bucket=id:7digital-UK&bucket=id:spotify-WW&bucket=id:rdio-US&bucket=id:deezer&bucket=id:songkick&bucket=tracks&bucket=song_type&bucket=audio_summary&results=1&api_key='.$this->echonestKey;
            $response = webGet($url, '+2 days');
            $response = json_decode($response, true);
            $finalData = $response['response']['songs'][0];

            // Filter tracks
            $filteredTracks = array();
            $hasSpotify = false;
            $has7digital = false;
            $trackID7Digital = null;
            for ($i=0; $i<count($finalData['tracks']); $i++) {
                $track = $finalData['tracks'][$i];

                // Only add a single 7digital entry
                if (strstr($track['catalog'], '7digital') && $has7digital == false) {
                    $filteredTracks[] = $track;
                    $has7digital = true;
                    $trackID7Digital = end(explode(':', $track['foreign_id']));
                }

                // Only add a single Spotify entry
                if (strstr($track['catalog'], 'spotify') && $hasSpotify == false) {
                    $filteredTracks[] = $track;
                    $hasSpotify = true;
                }

            }
            $finalData['tracks'] = $filteredTracks;
            $finalData['sevendigital'] = $this->get7DigitalData($trackID7Digital);

            $this->trackData = $finalData;

            return $this->trackData;
        }

        function get7DigitalData($trackID) {
            if ($trackID) {
                // If Echonest has returned a 7digital ID use it to get the details
                $url = "http://api.7digital.com/1.2/track/details?trackid=$trackID&oauth_consumer_key=".$this->_7DigitalKey."&pagesize=1";
                $xpathRoot = '/response'; 
            } else {
                // Otherwise search for the track using the artist and track names
                $searchTerm = urlencode($this->artist." ".$this->song);
                $url = "http://api.7digital.com/1.2/track/search?q=$searchTerm&oauth_consumer_key=".$this->_7DigitalKey."&pagesize=1";
                $xpathRoot = '/response/searchResults/searchResult[1]';
            }
            $response = webGet($url, '+2 days');
            if (strlen($response) == 0) return false;

            $xml = new SimpleXMLElement($response);
            $trackResponse = array(
                id              => $xml->xpath($xpathRoot.'/track/@id'),
                track_url       => $xml->xpath($xpathRoot.'/track/url'),
                release_url     => $xml->xpath($xpathRoot.'/track/release/url'),
                artist_url      => $xml->xpath($xpathRoot.'/track/artist/url')
            );
            $trackResponse['id'] = (int)$trackResponse['id'][0];
            $trackResponse['track_url'] = (string)$trackResponse['track_url'][0];
            $trackResponse['release_url'] = (string)$trackResponse['release_url'][0];
            $trackResponse['artist_url'] = (string)$trackResponse['artist_url'][0];

            $trackID = $xml->xpath($xpathRoot.'/track/@id');
            $trackID = (int)$trackID[0];
            $this->trackID7Digital = $trackID;

            return $trackResponse;
        }

        function downloadPreviewAudio($targetFilename) {
            if (file_exists($targetFilename) || !$this->trackID7Digital) { return; }
            $previewAudio = file_get_contents("http://api.7digital.com/1.2/track/preview?trackid={$this->trackID7Digital}&oauth_consumer_key=".$this->_7DigitalKey);

            if (strlen($previewAudio) < 1024) { return; }
            file_put_contents($targetFilename, $previewAudio);
        }

        /*function downloadPreviewAudio($targetFilename) {
            // Get the first track that we find in the results
            foreach ($this->trackData['tracks'] as $track) {
                if (empty($this->previewUrl) && !empty($track['preview_url'])) {
                    $this->previewUrl = $track['preview_url'];
                    break;
                }
            }

            if ($this->previewUrl && !file_exists($targetFilename)) {
                $previewAudio = file_get_contents($this->previewUrl);
                file_put_contents($targetFilename, $previewAudio);
            }

            if (empty($this->previewUrl)) {
                echo "(No audio available)";
            }
        }*/

    }
?>