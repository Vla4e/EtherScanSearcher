import os.path
import datetime
import time
import json

import scrapy
from scrapy_selenium import SeleniumRequest
from selenium import webdriver

class ContractsSpider(scrapy.Spider):
  name = "contracts"
  allowed_domains = ["etherscan.io"]

  def __init__(self):
    self.pages = []
    self.contracts = []
    self.NUM_PAGES = 4

    self.telegrams = []
    if os.path.isfile('telegrams.json'):
      f = open('telegrams.json', 'r')
      telegrams_json_str = f.read()
      f.close()
      self.telegrams = json.loads(telegrams_json_str)
    else:
      f = open('telegrams.json', 'w')
      f.write(json.dumps(self.telegrams))
      f.close()

  @classmethod
  def from_crawler(cls, crawler, *args, **kwargs):
    spider = super().from_crawler(crawler, *args, **kwargs)
    crawler.signals.connect(spider.spider_closed, signal=scrapy.signals.spider_closed)
    crawler.signals.connect(spider.spider_opened, signal=scrapy.signals.spider_opened)
    return spider

  def spider_opened(self, spider):
    self.driver = webdriver.Firefox()

  def start_requests(self):
    self.pages = [scrapy.Request(f'https://etherscan.io/contractsVerified/{page}', callback=self.parse_page, dont_filter=True) for page in range(1, self.NUM_PAGES + 1)]
    self.pages.reverse()
    yield self.pages.pop()

  def parse_page(self, response):
    self.driver.get(response.url)

    contracts = self.driver.find_elements_by_css_selector('.table-responsive > table > tbody > tr > td:nth-child(1) > a')
    for contract in contracts:
      contract_address = contract.text.lower()
      already_crawled = len(list(filter(lambda telegram: telegram['contract_address'] == contract_address, self.telegrams))) > 0
      if already_crawled == False:
        self.contracts.append(f'https://etherscan.io/address/{contract_address}#code')

    try:
      yield self.pages.pop()
    except IndexError:
      for contract in self.contracts:
        yield scrapy.Request(contract, callback=self.parse_content)

  def parse_content(self, response):
    self.driver.get(response.url)

    self.driver.execute_script("updatehash('code')")
    time.sleep(0.5)

    contract_name = self.driver.title.split('|')[0].strip()
    contract_address = self.driver.find_element_by_id('mainaddress').text.lower()

    telegram_obj = {
      'contract_name': contract_name,
      'contract_address': contract_address,
      'telegram_groups': [],
      'timestamp': datetime.datetime.now().isoformat()
    }

    code_comments = self.driver.find_elements_by_css_selector('.ace_text-layer > .ace_line_group > .ace_line > .ace_comment')
    for code_comment in code_comments:
      code_comment_text = code_comment.text      
      if 't.me/' in code_comment_text:
        telegram_group_name = code_comment_text.split('t.me/', 1)[1]
        telegram_obj['telegram_groups'] = [telegram_group_name]

    self.telegrams.append(telegram_obj)
    f = open('telegrams.json', 'w')
    f.write(json.dumps(self.telegrams, indent=3))
    f.close()

  def spider_closed(self, spider):
    self.driver.close()