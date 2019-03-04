//api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw"
//srch_eng_id = "012928527837730696752:wzqnawdyxwc"

const fetch = require('node-fetch');

module.exports = {
    fetchColor:function(keyword, api_key, srch_eng_id){
                
        var srchRequest = 'https://www.googleapis.com/customsearch/v1?key=' + api_key + '&cx=' + srch_eng_id + '&q=' + keyword + '&searchType=image';
                
        var collect = fetch(srchRequest);
        return collect;
                        
                        
    }
};
        
        
        
 