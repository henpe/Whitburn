<?php
    date_default_timezone_set('UTC');

    $debug = false;

    // Utilities
    include_once('cache.php');
    $wgCache = new Cache();

    function webGet($url, $ttl = '+30 minutes', $override = false, $delay = true) {
        global $wgCache;

        $context = stream_context_create(array(
            'http' => array(
                'timeout' => 60
                )
            )
        );

        $content = $wgCache->read($url);
        if (empty($content)) {
            echo ' [webget] ';
	        $content = @file_get_contents($url, false, $context);
	        $content = preg_replace('/<!--(.|\s)*?-->/', '', $content); // Remove comments
	        $content = preg_replace('/\s\s+/', ' ', $content); // Remove newlines
	        $content = iconv("UTF-8","UTF-8//IGNORE", $content);

	        $wgCache->write($url, $content, $ttl);

            if ($delay) {
                // Delay for half a second
                time_nanosleep(0, 500000000);
            }
        }

        return $content;
    }


    function debug($content) {
        echo '<pre>';
        print_r($content);
        echo '</pre>';
    }


    function relativeTime($seconds){
        if($seconds < 60){
            if($seconds < 0){ $seconds = 0; }
            switch($seconds){
                case 1:
                    return "1 second";
                    break;
                default:
                    return "$seconds seconds";
                    break;
            }
        }else{
            $date_push = array();
            $time_units = array(	'year'		=> (365*24*60*60),
                        'month'		=> (30*24*60*60),
                        'week'		=> (7*24*60*60),
                        'day'		=> (24*60*60),
                        'hour'		=> (60*60),
                        'minute'	=> (60));
            foreach($time_units as $unit=>$unit_time){
                $total = 0;
                if($unit=='day' && count($date_push) && ($seconds < $time_units['day'])){
                    $seconds = 0;
                }
                while($seconds >= $unit_time){
                    $seconds -= $unit_time;
                    $total++;
                }
                switch ($total){
                    case 0:
                        break;
                    case 1:
                        $date_push[] = "1 $unit";
                        break;
                    default:
                        $date_push[] = "$total {$unit}s";
                        break;
                }
                if(count($date_push) == 2){
                    break;
                }
            }
            return implode(" and ", $date_push);
        }
    }

    //
?>