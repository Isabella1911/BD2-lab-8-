import neo4j from 'neo4j-driver';

const URI      = 'neo4j+s://3a57852d.databases.neo4j.io'; // <-- tu URI
const USER     = '3a57852d';
const PASSWORD = 'vUDGLPDASry4rLxZ9peSmtbv1mr7PUTuvGeoesqed_E';                       // <-- tu password
 
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
 
// FUNCIÓN 1: createUser(name, userId)

async function createUser(name, userId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MERGE (u:User {userId: $userId})
       ON CREATE SET u.name = $name
       RETURN u.name AS name, u.userId AS userId`,
      { name, userId }
    );
    const record = result.records[0];
    console.log(`[USER CREADO]  name: "${record.get('name')}" | userId: "${record.get('userId')}"`);
    return record;
  } catch (err) {
    console.error(`Error en createUser:`, err.message);
  } finally {
    await session.close();
  }
}
 
// FUNCIÓN 2: createMovie(title, movieId, year, plot)

async function createMovie(title, movieId, year, plot) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MERGE (m:Movie {movieId: $movieId})
       ON CREATE SET
         m.title = $title,
         m.year  = $year,
         m.plot  = $plot
       RETURN m.title AS title, m.movieId AS movieId, m.year AS year`,
      { title, movieId: neo4j.int(movieId), year: neo4j.int(year), plot }
    );
    const record = result.records[0];
    console.log(`[MOVIE CREADA] title: "${record.get('title')}" | movieId: ${record.get('movieId')} | year: ${record.get('year')}`);
    return record;
  } catch (err) {
    console.error(` Error en createMovie:`, err.message);
  } finally {
    await session.close();
  }
}
 
 

// DATOS DE PRUEBA

const USUARIOS = [
  { name: 'Alice Johnson',   userId: 'u001' },
  { name: 'Bob Martinez',    userId: 'u002' },
  { name: 'Carlos Pérez',    userId: 'u003' },
  { name: 'Diana López',     userId: 'u004' },
  { name: 'Eduardo Ramírez', userId: 'u005' },
];
 
const PELICULAS = [
  { title: 'Inception',                 movieId: 1,  year: 2010, plot: 'Un ladrón roba secretos a través de los sueños.' },
  { title: 'The Matrix',                movieId: 2,  year: 1999, plot: 'Un hacker descubre la verdad sobre su realidad.' },
  { title: 'Interstellar',              movieId: 3,  year: 2014, plot: 'Exploradores viajan a través de un agujero de gusano.' },
  { title: 'The Dark Knight',           movieId: 4,  year: 2008, plot: 'Batman enfrenta al Joker en Gotham City.' },
  { title: 'Forrest Gump',              movieId: 5,  year: 1994, plot: 'La vida extraordinaria de un hombre ordinario.' },
  { title: 'Parasite',                  movieId: 6,  year: 2019, plot: 'Una familia pobre se infiltra en una familia rica.' },
  { title: 'The Godfather',             movieId: 7,  year: 1972, plot: 'La historia de la familia mafiosa Corleone.' },
  { title: 'Pulp Fiction',              movieId: 8,  year: 1994, plot: 'Historias entrelazadas del crimen en Los Ángeles.' },
  { title: 'The Shawshank Redemption',  movieId: 9,  year: 1994, plot: 'Un banquero encarcelado injustamente encuentra esperanza.' },
  { title: 'Avengers: Endgame',         movieId: 10, year: 2019, plot: 'Los Vengadores luchan para revertir el chasquido de Thanos.' },
];
 
 

// MAIN: ejecuta todo en orden

async function main() {
  
  console.log(' Setup');
  
 
  // Verificar conexión
  try {
    await driver.verifyConnectivity();
    console.log('Conexión exitosa con AuraDB\n');
  } catch (err) {
    console.error(' No se pudo conectar a AuraDB:', err.message);
    process.exit(1);
  }
 
  // Crear usuarios
  
  console.log(' Creando 5 usuarios...');
  
  for (const u of USUARIOS) {
    await createUser(u.name, u.userId);
  }
 
  // Crear películas
  console.log(' Creando 10 películas...');
  
  for (const m of PELICULAS) {
    await createMovie(m.title, m.movieId, m.year, m.plot);
  }
 
  console.log('\n set up completada.');

 
  await driver.close();
}
 
main();