// 1 Znajdź trasy którymi można dostać się z Darjeeling na Sandakphu, mające najmniejszą ilość etapów
MATCH p = shortestPath((t1 {name: 'Darjeeling'})-[*]->(t2 {name: 'Sandakphu'})) RETURN p

// 2 Znajdź mające najmniej etapów trasy którymi można dostać się z Darjeeling na Sandakphu i które mogą być wykorzystywane zimą
MATCH (t1 {name: 'Darjeeling'}),
(t2 {name: 'Sandakphu'}),
p = shortestPath((t1)-[*]->(t2))
WHERE ALL(r in relationships(p) WHERE r.winter = 'true')
return p

// 3 Uszereguj trasy którymi można dostać się z Darjeeling na Sandakphu według dystansu
match (t1 {name: 'Darjeeling'}),
(t2 {name: 'Sandakphu'}),
p = (t1)-[*]->(t2)
WITH p, REDUCE(x = 0, r in relationships(p) | x + r.distance ) AS p_distance
ORDER BY p_distance asc
RETURN p

// 4 Znajdź wszystkie miejsca do których można dotrzeć przy pomocy roweru (twowheeler) z Darjeeling latem
MATCH (t {name: 'Darjeeling'}),
p = (t)-[:twowheeler*]->(d)
WHERE ALL (r in relationships(p) WHERE r.summer = 'true')
RETURN d

// 5 Uszereguj porty lotnicze według ilości rozpoczynających się w nich lotów
MATCH p = (n:Airport)<-[r:ORIGIN]-(d)
WITH n, COUNT(relationships(p)) AS r_count
ORDER BY r_count desc
RETURN n.name, r_count

// powiązanie pomocnicze
MATCH p = (a:Airport)<-[:ORIGIN]-(f:Flight)-[:DESTINATION]->(d:Airport),
t = (f:Flight)<-[:ASSIGN]-(ticket: Ticket)
WITH a, d, ticket
CREATE nr = (a)-[r:FLIES_TO {price: ticket.price}]->(d)
RETURN nr

// 6 Znajdź wszystkie porty lotnicze, do których da się dolecieć (bezpośrednio lub z przesiadkami) z Los Angeles (LAX) wydając mniej niż 3000
MATCH p = (:Airport { name:'LAX' })-[:FLIES_TO*..2]->(d:Airport)
WHERE reduce(acc=0, n IN relationships(p) | acc + n.price) < 3000
RETURN p

// 7 Uszereguj połączenia, którymi można dotrzeć z Los Angeles (LAX) do Dayton (DAY) według ceny biletów


// 8 Znajdź najtańsze połączenie z Los Angeles (LAX) do Dayton (DAY)


// wip

MATCH p = (a:Airport { name:'LAX' })<-[:ORIGIN]-(f:Flight)-[:DESTINATION]->(d:Airport)
FOREACH (n IN [(f)<-[:ASSIGN]-(t:Ticket) | t] | CREATE (a)-[:FLIES_TO {price: n.price}]->(d))
return p

MATCH p = (a:Airport { name:'LAX' })<-[:ORIGIN]-(f:Flight)-[:DESTINATION]->(d:Airport),
t = (f:Flight)<-[:ASSIGN]-(ticket: Ticket)
return t,p

// powiązanie pomocnicze
MATCH p = (a:Airport { name:'LAX' })<-[:ORIGIN]-(f:Flight)-[:DESTINATION]->(d:Airport),
t = (f:Flight)<-[:ASSIGN]-(ticket: Ticket)
with a, d, ticket
create nr = (a)-[r:FLIES_TO {price: ticket.price}]->(d)
return nr

MATCH p=()-[r:FLIES_TO]->() DELETE r


// single link
MATCH p = (a:Airport)<-[:ORIGIN]-(f:Flight)-[:DESTINATION]->(d:Airport)
WITH DISTINCT a,d
CREATE tr = (a)-[:FLIES_TO]->(d)
RETURN tr