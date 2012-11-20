<?php
    class Track {

        function __construct($song, $artist, $year) {

            $this->echonestKey = 'ZUDBPBLHIZ8VN23BR';

            $this->song = $song;
            $this->artist = $artist;
            $this->getTrackData();
        }


        function getTrackData() {
            $searchTerm = $this->trackName;
            $response = webGet('http://developer.echonest.com/api/v4/song/search?artist='.urlencode($this->artist).'&title='.urlencode($this->song).'&bucket=id:7digital-US&bucket=song_type&bucket=tracks&bucket=audio_summary&bucket=song_hotttnesss&api_key='.$this->echonestKey);
            $this->response = json_decode($response, true);

            $topSong = $this->response['response']['songs'][0];

            if (count($topSong['tracks'])) {
                $topTrack = $topSong['tracks'][0];
            }

        }


        function downloadPreviewAudio($targetFilename) {
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
        }

    }
?>