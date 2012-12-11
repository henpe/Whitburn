<?php
    include('_lib/utils.php');
    include('_lib/track.php');

    $capsuleLengthInSecs = 5;  // Final value should be 3

    $hitlistData = json_decode(file_get_contents('hitlist_1-5.json'), true);
    $hitlist = $hitlistData['rows'];
    //$hitlist = array_splice($hitlist, 0, 6);

    $audioFileList = array();
    $allTrackData = array();

    /*
     * STEP 1 : Download preview files
     */
    $index = 0;
    foreach ($hitlist as $track) {
        $hitData = array(
            'year'                  => intval($track[0]),
            'artist'                => $track[1],
            'song'                  => $track[2],
            'album'                 => $track[3],
            'yearly_rank'           => intval($track[4]),
            'time'                  => $track[5],
            'no_of_weeks_charted'   => $track[6],
            'date_entered'          => $track[7],
            'date_peaked'           => $track[8]
        );

        $trackName = "${hitData['year']}: ${hitData['artist']} ${hitData['song']} ";
        echo $trackName;

        $track = new Track($hitData['song'], $hitData['artist'], $hitData['year']);
        $trackData = $track->getTrackData();

        // Create clean filename
        $filename = strtolower("${hitData['year']}-${hitData['artist']}-${hitData['song']}");
        $filename = preg_replace("/[^a-zA-Z0-9\s\-{P}]/", "", $filename);
        $filename = str_replace(' ', '-', $filename);
        $filename = 'input/'.$filename.'.mp3';

        // Download Audio - only for the Top track!
        if ($hitData['yearly_rank'] == 1) {
            $track->downloadPreviewAudio($filename);

            if (file_exists($filename)) {
                $audioFileList[] = $filename;
                // Keep track of the index in the full array 
                // to match up the timestamps in step 4
                $audioIndexList[] = $index;
            }
        }

        $trackData = array_merge($trackData, $hitData);
        $allTrackData[] = $trackData;
        $index += 1;

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
    $command = "time python _lib/capsule.py -e -i $capsuleLengthInSecs -t $capsuleLengthInSecs ";
    $command .= join(' ', $audioFileList);
    $shell = `$command`;

    //echo $command;
    echo $shell;

    /*
     * STEP 4: Create a timed running order
     */
    preg_match_all('/<playlist>(.*?)<\/playlist>/s', $shell, $matches);
    $listing = trim($matches[1][0]);
    $listing = explode("\n", $listing);
    $listingJson = array();

    // Remove fadein and fadeout
    array_splice($listing, 0, 1);

    $index = 0;
    $audioIndex = 0;
    foreach ($listing as $entry) {
        // Grab every even entry, this will be the 
        // playback timestamps rather than the crossfade ones.
        // This is to get around an issue where some timestamps
        // have "na" as type, rather than playback or crossfade.
        if ($index % 2 === 0) {
            $entry      = explode("\t", $entry);
            $timestamp  = floatval(trim($entry[1]));
            $name       = $audioFileList[$audioIndex];//trim($entry[6]);
            $type       = trim($entry[2]);
            $type       = strtolower(str_replace(' ', '-', $type));

            $listingJson[] = array(
                'timestamp' => $timestamp,
                'type'      => $type,
                'name'      => $name
            );

            $currentTrack = $audioIndexList[$audioIndex];
            $allTrackData[$currentTrack]['audio'] = array(
                'timestamp' => $timestamp,
                'name'      => $name
            );
            $audioIndex += 1;
        }

        $index += 1;
    }

    //debug($listingJson);
    //debug($allTrackData);

    file_put_contents('tracks_data.json', json_encode($allTrackData));
    file_put_contents('tracks_playlist.json', json_encode($listingJson));

    rename('capsule.mp3', 'output/mix-'.date('Ymd-Hi').'.mp3');

?>