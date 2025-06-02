# ExpressApp-API

## Jak uruchomić projekt
1. Sklonuj repozytorium:
```bash
git clone https://github.com/Kopcin/ExpressApp-API.git
```
3. Zainstaluj zależności:
```bash
npm install
```
5. Uruchom serwer:
```bash
node index.js
```
Serwer będzie dostępny pod adresem:
http://localhost:3000

## Endpointy API
### 1. Eksport zamówień do CSV

GET /orders/csv
* Pobiera wszystkie sprzedane produkty do pliku CSV.
* Obsługuje query parametry:
  * minWorth,
  * maxWorth.

Przykład:

curl "http://localhost:3000/orders/csv?minWorth=100&maxWorth=500"

### 2. Pobranie pojedynczego zamówienia

GET /orders/:id
* Zwraca dane jednego zamówienia na podstawie jego orderID.

Przykład:

curl "http://localhost:3000/orders/tetete0211211006-33"
