<?php
    date_default_timezone_set('UTC');
   
    class Cache {
        var $tmpDir;
        var $filenamePrefix = 'cache-';
    
        function __construct() {
            $this->tmpDir = dirname(__FILE__).'/cachetmp';           
        
            if (!file_exists($this->tmpDir)) {
                mkdir($this->tmpDir, 0777);
            }
            
        }
        
        
        function write($key, $value, $ttl = '+30 minutes') {
            unset($cache);
            $shardMD5 = bin2hex(md5($key, true)); 	    

            $cacheFile = $this->tmpDir.'/'.$this->filenamePrefix.substr($shardMD5, -2).'.tmp';
            if (file_exists($cacheFile)) { 
                $cache = unserialize(file_get_contents($cacheFile)); 
            }	    	
              
            $expiry = strtotime($ttl);
            $cache[$key] = array(	            
                'ttl'  => $expiry,
                'val' => $value //iconv("UTF-8","UTF-8//IGNORE", $value)
            );
                        
            // Do cleanups here
            foreach ($cache as $tmpKey=>$tmpCache) {
                if (time() > $tmpCache['ttl']) {
                    unset($cache[$tmpKey]);
                }
            }            

            if (!empty($value)) {
                file_put_contents($cacheFile, serialize($cache));
                @chmod($cacheFile, 0777);                                
            }             
        }
        
        
        
        function read($key) {
            unset($cache);
            $shardMD5 = bin2hex(md5($key, true)); 	    
            
            $cacheFile = $this->tmpDir.'/'.$this->filenamePrefix.substr($shardMD5, -2).'.tmp';
            if (file_exists($cacheFile)) { 
                $cache = unserialize(file_get_contents($cacheFile)); 
            } else {
                return false;
            }                        
        
            if (!empty($cache[$key]) && time() <= $cache[$key]['ttl']) {    
                return $cache[$key]['val'];
            }
            
            return false;
        }
    }            
?>