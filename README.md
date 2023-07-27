# iot-streamer

### Setup

docker-compose up

#### Kafka

Port 9092

#### Kafka UI

localhost:8080

#### Vault UI

localhost:8200

#### Vault

docker exec -it 01aae87ca2ac /bin/bash  
vault operator init  
vault operator unseal  
vault operator unseal  
vault operator unseal  
vault login  
vault secrets enable kv  
vault kv put kv/iot-streamer RTDgtfsRT='realT!m3Feed'

#### Elasticsearch

curl --cacert ./infrastructure/elasticsearch/certs/ca.crt -u elastic:changeme https://localhost:9200

#### Kibana

http://localhost:5601