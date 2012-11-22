<?php
    class Track {

        function __construct($song, $artist, $year) {

            $this->echonestKey = 'ZUDBPBLHIZ8VN23BR';

            $this->song = $song;
            $this->artist = $artist;

            $this->get7DigitalTrackID("$artist $song");
        }


        function getTrackData() {
            $searchTerm = $this->trackName;
            $response = webGet('http://developer.echonest.com/api/v4/song/search?artist='.urlencode($this->artist).'&title='.urlencode($this->song).'&bucket=id:7digital-UK&bucket=song_type&bucket=tracks&bucket=audio_summary&bucket=song_hotttnesss&api_key='.$this->echonestKey);
            $this->response = json_decode($response, true);

            $topSong = $this->response['response']['songs'][0];

            if (count($topSong['tracks'])) {
                $topTrack = $topSong['tracks'][0];
            }
        }

        function getEchoNestData() {
            $response = webGet('http://developer.echonest.com/api/v4/song/profile?track_id=7digital-UK:track:'.$this->trackID7Digital.'&bucket=id:7digital-UK&bucket=song_type&bucket=tracks&bucket=audio_summary&bucket=song_hotttnesss&api_key='.$this->echonestKey);
            $response = json_decode($response, true);
            $this->trackData = $response['response']['songs'];
            return $this->trackData;
        }

        function get7DigitalTrackID($searchTerm) {
            $searchTerm = urlencode($searchTerm);
            $url = "http://api.7digital.com/1.2/track/search?q=$searchTerm&oauth_consumer_key=musichackday&country=GB&pagesize=2";

            //echo $url."\n";
            $response = webGet($url);
            if (strlen($response) == 0) return false;

            $xml = new SimpleXMLElement($response);
            $trackID = $xml->xpath('//searchResult[1]/track/@id');
            $trackID = (int)$trackID[0];

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