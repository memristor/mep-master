"ElasticSearch is a distributed, open source search and analytics engine, designed for horizontal scalability, reliability, and easy management."

### 1. Install ElasticSearch
This installation guide for Ubuntu, but it is very similar on other OS-s
```
wget https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/deb/elasticsearch/2.4.0/elasticsearch-2.4.0.deb
sudo dpkg -i elasticsearch-2.4.0.deb
```

### 2. Add a few lines in file
Open file
```
sudo gedit /etc/elasticsearch/elasticsearch.yml
```
and add those lines
```
http.cors.enabled: true
http.cors.allow-origin: "*"
```

### 3. Start ElasticSearch
```sudo /etc/init.d/elasticsearch restart```

### 4. Override config in MEP
Insert your PC's IP address in MEP's config

### 5. Use ElasticSearch GUI
Find and pick your favorite ElasticSearch GUI and start exploring the logs.
- ElasticHQ (http://www.elastichq.org/app/index.php)
- Head (https://github.com/mobz/elasticsearch-head)