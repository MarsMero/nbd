// 1. Wszystkie filmy
MATCH (m: Movie) RETURN m

// 2. Wszystkie filmy, w których grał Hugo Weaving
MATCH (a {name: "Hugo Weaving"}) -[:ACTED_IN]->  (m: Movie) RETURN m 

// 3. Reżyserzy filmów, w których grał Hugo Weaving
MATCH (a {name: "Hugo Weaving"}) -[:ACTED_IN]->  (:Movie) <-[:DIRECTED]-(directors)  RETURN DISTINCT directors 

// 4. Wszystkie osoby, z którymi Hugo Weaving grał w tych samych filmach
MATCH (a {name: "Hugo Weaving"}) -[:ACTED_IN]->  (:Movie) <-[:ACTED_IN]-(coActors) RETURN DISTINCT coActors 

// 5. Wszystkie filmy osób, które grały w Matrix
MATCH ({title: "The Matrix"}) <-[:ACTED_IN]-(:Person) -[:ACTED_IN]-> (m: Movie) RETURN DISTINCT m

// 6. Listę aktorów (aktor = osoba, która grała przynajmniej w jednym filmie) wraz z ilością filmów, w których grali
MATCH (a: Person) -[:ACTED_IN]->(m:Movie)
WITH a, count(m) as nOfMovies
RETURN a, nOfMovies

// 7. Listę osób, które napisały scenariusz filmu, które wyreżyserowały wraz z tytułami takich filmów (koniunkcja – ten sam autor scenariusza i reżyser)
MATCH (director: Person) -[:DIRECTED]->(m:Movie) <-[:WROTE]-(writer: Person)
WHERE director = writer
RETURN director, m.title

// 8. Listę filmów, w których grał zarówno Hugo Weaving jak i Keanu Reeves
MATCH (:Person {name: "Hugo Weaving"}) -[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]- (:Person {name: "Keanu Reeves"}) RETURN m

// 9. Zestaw zapytań powodujących uzupełnienie bazy danych o film Captain America: The First Avenge
CREATE (CaptainAmerica:Movie {title:'Captain America: The First Avenger', released:2011, tagline:'When patriots become heroes'})
CREATE (ChrisEvans: Person {name:'Chris Evans', born:1981})
CREATE (SamuelLJackson: Person {name:'Samuel L. Jackson', born:1948})
CREATE (HayleyAtwell: Person {name:'Hayley Atwell', born:1982})
CREATE (JoeJohnston: Person {name: 'Joe Johnston', born:1950})
CREATE (ChristopherMarkus: Person {name: 'Christopher Markus', born: 1970})
CREATE
(ChrisEvans)-[:ACTED_IN {roles:['Captain America']}]->(CaptainAmerica),
(SamuelLJackson)-[:ACTED_IN {roles:['Nick Fury']}]->(CaptainAmerica),
(HayleyAtwell)-[:ACTED_IN {roles:['Peggy Carter']}]->(CaptainAmerica),
(Hugo)-[:ACTED_IN {roles:['Johann Schmidt']}]->(CaptainAmerica),
(JoeJohnston)-[:DIRECTED]->(CaptainAmerica),
(ChristopherMarkus)-[:WROTE]->(CaptainAmerica)

MATCH (m: Movie {title: "Captain America: The First Avenger"})<-[]-(p: Person) RETURN m,p