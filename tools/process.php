<?php
    include('_lib/utils.php');
    include('_lib/track.php');

    $capsuleLengthInSecs = 5;

    $hitlistData = json_decode(file_get_contents('hitlist.json'), true);
    $hitlist = $hitlistData['rows'];
    //$hitlist = array_splice($hitlist, 0, 6);

    $audioFileList = array();
    $allTrackData = array();

    /*
     * STEP 1 : Download preview files
     */

    foreach ($hitlist as $track) {
        $year   = $track[0];
        $artist = $track[1];
        $song   = $track[2];

        $trackName = "$year: $artist $song ";
        echo $trackName;

        // Create clean filename
        $filename = strtolower("$year-$artist-$song");
        $filename = preg_replace("/[^a-zA-Z0-9\s\-{P}]/", "", $filename);
        $filename = str_replace(' ', '-', $filename);
        $filename = 'input/'.$filename.'.mp3';

        // Download Audio
        $track = new Track($song, $artist, $year);
        $track->downloadPreviewAudio($filename);

        if (file_exists($filename)) {
            $audioFileList[] = $filename;
        }

        $allTrackData[$year] = $track->getEchoNestData();

        echo "\n";
    }



    /*
     * STEP 2: Normalise audio to 44Khz
     *         The RemixAPI doesn't like different sample rates
     */

    foreach($audioFileList as $file) {
        if (!file_exists($file)) { continue; }
        $shell = `ffmpeg -i $file 2>&1`;
        preg_match('/,\s(.*?)\sHz/m', $shell, $matches);

        // Convert any non-44Khz files
        if ($matches[1] != '44100') {
            $tmpFile = str_replace('.mp3', '.tmp.mp3', $file);
            $shell = `ffmpeg -i $file -ab 320k -ar 44100 $tmpFile`;

            unlink($file);
            rename($tmpFile, $file);
        }
    }


    /*
     * STEP 3: Mix it all together
     */
    $reverseAudioList = array_reverse($audioFileList);
    $command = "time /opt/local/bin/python2.7 _lib/capsule.py -e -i $capsuleLengthInSecs -t $capsuleLengthInSecs ";
    $command .= join(' ', $reverseAudioList);
    $shell = `$command`;

    //echo $command;
    //echo $shell;

    /*
     * STEP 4: Create a timed running order
     */
    preg_match_all('/<playlist>(.*?)<\/playlist>/s', $shell, $matches);
    $listing = trim($matches[1][0]);
    $listing = explode("\n", $listing);
    $listingJson = array();

    $yearKeys = array_keys($allTrackData);

    $index = 0;
    foreach ($listing as $entry) {
        $entry = explode("\t", $entry);
        $timestamp = trim($entry[1]);
        $name      = trim($entry[6]);
        $type      = trim($entry[2]);
        $type      = strtolower(str_replace(' ', '-', $type));

        $listingJson[] = array(
            'timestamp' => $timestamp,
            'type'      => $type,
            'name'      => $name
        );


        if ($type == 'playback') {

            $currentYear = $yearKeys[$index];
            $allTrackData[$currentYear]['audio'] = array(
                'timestamp' => $timestamp,
                'name'      => $name
            );

            $index += 1;
        }
    }

    //debug($listingJson);
    //debug($allTrackData);

    file_put_contents('tracks_data.json', json_encode($allTrackData));
    file_put_contents('tracks_playlist.json', json_encode($listingJson));

    rename('capsule.mp3', 'output/mix-'.date('Ymd-Hi').'.mp3');

?>