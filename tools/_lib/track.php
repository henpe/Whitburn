<?php
    class Track {

        function __construct($song, $artist, $year) {

            $this->echonestKey = 'ZUDBPBLHIZ8VN23BR';
            $this->_7DigitalKey = '7d8p87g5dz8g';

            $this->song = $song;
            $this->artist = $artist;
            $this->year = $year;

            // Henrik: Commented out this temporarily so we can get the data
            // from Echonest
            //$this->get7DigitalTrackID("$artist $song");
        }


        function getTrackData() {
            $searchTerm = $this->trackName;
            $response = webGet('http://developer.echonest.com/api/v4/song/search?artist='.urlencode($this->artist).'&title='.urlencode($this->song).'&bucket=id:7digital-UK&bucket=song_type&bucket=tracks&bucket=audio_summary&bucket=song_hotttnesss&api_key='.$this->echonestKey, '+2 days');
            $this->response = json_decode($response, true);

            $topSong = $this->response['response']['songs'][0];

            if (count($topSong['tracks'])) {
                $topTrack = $topSong['tracks'][0];
            }
        }

        function getEchoNestData() {
            // Henrik: Changed to use search as we don't have the 7digital id when
            // get7DigitalTrackID is commented out
            //$url = 'http://developer.echonest.com/api/v4/song/profile?track_id=7digital-UK:track:'.$this->trackID7Digital.'&bucket=id:7digital-UK&bucket=tracks&bucket=id:spotify-WW&bucket=song_type&bucket=audio_summary&bucket=song_hotttnesss&api_key='.$this->echonestKey;
            $url = 'http://developer.echonest.com/api/v4/song/search?artist='.urlencode($this->artist).'&title='.urlencode($this->song).'&bucket=artist_familiarity&bucket=song_hotttnesss&bucket=artist_location&bucket=id:musicbrainz&bucket=id:7digital-US&bucket=id:spotify-WW&bucket=id:rdio-US&bucket=id:deezer&bucket=id:songkick&bucket=tracks&bucket=song_type&bucket=audio_summary&results=1&api_key='.$this->echonestKey;
            $response = webGet($url, '+2 days');
            $response = json_decode($response, true);
            $finalData = $response['response']['songs'][0];

            // Filter tracks
            $filteredTracks = array();
            $hasSpotify = false;
            $has7digital = false;
            for ($i=0; $i<count($finalData['tracks']); $i++) {
                $track = $finalData['tracks'][$i];

                // Henrik: Commented out as 7digital ID is missing
                // Only add the 7DigitalID that we have the audio sample of
                //if (strstr($track['foreign_id'], '7digital-UK:track:'.$this->trackID7Digital)) {
                //    $filteredTracks[] = $track;
                //}
                if (strstr($track['catalog'], '7digital') && $has7digital == false) {
                    $filteredTracks[] = $track;
                    $has7digital = true;
                }

                // Only add a single Spotify entry
                if (strstr($track['catalog'], 'spotify') && $hasSpotify == false) {
                    $filteredTracks[] = $track;
                    $hasSpotify = true;
                }

            }

            $finalData['tracks'] = $filteredTracks;

            $this->trackData = $finalData;
            $this->trackData['trackdata_7digital_url'] = $this->trackApiUrl7Digital;
            $this->trackData['trackdata_7digital'] = $this->trackResponse7Digital;
            //$this->trackData['api_request'] = $url;
            return $this->trackData;
        }

        function get7DigitalTrackID($searchTerm) {
            $searchTerm = urlencode($searchTerm);
            $url = "http://api.7digital.com/1.2/track/search?q=$searchTerm&oauth_consumer_key=".$this->_7DigitalKey."&country=GB&pagesize=1";

            //echo $url."\n";
            $response = webGet($url, '+2 days');
            if (strlen($response) == 0) return false;

            $xml = new SimpleXMLElement($response);
            $trackID = $xml->xpath('//searchResult[1]/track/@id');
            $trackID = (int)$trackID[0];

            $this->trackApiUrl7Digital = $url;
            $this->trackResponse7Digital = $response;
            $this->trackID7Digital = $trackID;
            return $trackID;
        }

        function downloadPreviewAudio($targetFilename) {
            if (file_exists($targetFilename)) { return; }
            $previewAudio = file_get_contents("http://api.7digital.com/1.2/track/preview?trackid={$this->trackID7Digital}&oauth_consumer_key=musichackday");

            if (strlen($previewAudio) < 1024) { return; }
            file_put_contents($targetFilename, $previewAudio);
        }



        /*function downloadPreviewAudio($targetFilename) {
            // Get the first track that we find in the results
            foreach ($this->response['response']['songs'] as $song) {
                foreach ($song['tracks'] as $track) {
                    if (empty($this->previewUrl) && !empty($track['preview_url'])) {
                        $this->previewUrl = $track['preview_url'];
                        break;
                    }
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