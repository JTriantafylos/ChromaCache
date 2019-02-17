from bs4 import BeautifulSoup
from googleapiclient.discovery import build
import pprint

#''' pip install google-api-python-client '''
def get_url(keyword):
    
    my_api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw"
    my_cse_id = "012928527837730696752:wzqnawdyxwc"

    service = build("customsearch","v1", developerKey = my_api_key )
    res = service.cse.list(q= keyword, cx= my_cse_id, num=2).execute()
    return res['items']


results = get_url('dog')

for result in results:
    '''pprint.pprint(result)'''

    title = result['title']
    link = result['formattedUrl']
    dis = result['snippet']
    print (title)
    print (link)
    print (dis)




  


#print(get_url("dog"))
#websiteCode = urllib2.urlopen(get_url("dog"))

#soup = BeautifulSoup(websiteCode)

#images = []
#images = soup.findAll('img')

#for image in images:
 #   print(image)