import urllib.request as urllib2
import sys
import re

class Parse_Json:
    def __init__(self, rawHTML):
        

        self.rawHTML=(rawHTML)
        main(self)

    def fetch_html(self):
        rawHTML = self.rawHTML

        #equivalent to "link"
        target = [34,108,105,110,107,34]
        response = urllib2.urlopen(rawHTML)
        parsed_html = response.read()
        
        temp_urls = []
        urls = ""
        counter = 0
        for x in parsed_html:
            if(x == 34):
                temp_comparator = []
                temp_counter = counter
                
                for c in range(6):
                    temp_comparator.append(parsed_html[temp_counter])
                    temp_counter +=1
                
                if(target == temp_comparator):
                    url = self.fetch_link(counter+9, parsed_html)
                    temp_urls.append(url)
            counter+=1
        
        temp_url =""
        for t in temp_urls:
            for i in t:
                
                if(i != ']' and i != '[' and i !='\"' and i != '\'' and i != ' ' and i != '\\'):
                    temp_url += i
            
            urls += temp_url + ","
            temp_url = ""
        

        return(urls)

        
    def fetch_link(self,index, parsed_html):
        counter = index
        temp_url = []
        url_string = ""
        while(parsed_html[counter]!= 34):
            
            temp_url.append(parsed_html[counter])
            counter+= 1

        for x in temp_url:
            url_string += chr(x)
        return(url_string)

def main(self):
    print(self.fetch_html())

    
for v in sys.argv[1:]:
    pj = Parse_Json(v)