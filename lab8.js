import neo4j from 'neo4j-driver';

const URI      = 'neo4j+s://3a57852d.databases.neo4j.io'; // <-- URI
const USER     = '3a57852d';
const PASSWORD = 'vUDGLPDASry4rLxZ9peSmtbv1mr7PUTuvGeoesqed_E';                       // <-- password
 
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
 
 
// FUNCIÓN 3: createRated(userId, movieId, rating, timestamp)

async function createRated(userId, movieId, rating, timestamp) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       MATCH (m:Movie {movieId: $movieId})
       MERGE (u)-[r:RATED]->(m)
       ON CREATE SET
         r.rating    = $rating,
         r.timestamp = $timestamp
       RETURN u.name AS userName, m.title AS movieTitle, r.rating AS rating`,
      {
        userId,
        movieId:   neo4j.int(movieId),
        rating:    neo4j.int(rating),
        timestamp: neo4j.int(timestamp)
      }
    );
    const record = result.records[0];
    if (record) {
      console.log(` [RATED] "${record.get('userName')}" → "${record.get('movieTitle')}" | rating: ${record.get('rating')}/5`);
    } else {
      console.warn(`  No se encontró userId: "${userId}" o movieId: ${movieId}`);
    }
    return record;
  } catch (err) {
    console.error(` Error en createRated:`, err.message);
  } finally {
    await session.close();
  }
}
 
 

// DATOS: 5 usuarios + 10 películas


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
  { title: 'Forrest Gump',             movieId: 5,  year: 1994, plot: 'La vida extraordinaria de un hombre ordinario.' },
  { title: 'Parasite',                  movieId: 6,  year: 2019, plot: 'Una familia pobre se infiltra en una familia rica.' },
  { title: 'The Godfather',             movieId: 7,  year: 1972, plot: 'La historia de la familia mafiosa Corleone.' },
  { title: 'Pulp Fiction',              movieId: 8,  year: 1994, plot: 'Historias entrelazadas del crimen en Los Ángeles.' },
  { title: 'The Shawshank Redemption',  movieId: 9,  year: 1994, plot: 'Un banquero encarcelado injustamente encuentra esperanza.' },
  { title: 'Avengers: Endgame',         movieId: 10, year: 2019, plot: 'Los Vengadores luchan para revertir el chasquido de Thanos.' },
];
 

// RELACIONES: cada usuario ratea mínimo 2 películas distintas


const RATINGS = [
  // Alice Johnson (u001) → 3 películas
  { userId: 'u001', movieId: 1,  rating: 5, timestamp: 1700000001 },
  { userId: 'u001', movieId: 3,  rating: 4, timestamp: 1700000002 },
  { userId: 'u001', movieId: 5,  rating: 3, timestamp: 1700000003 },
 
  // Bob Martinez (u002) → 3 películas
  { userId: 'u002', movieId: 2,  rating: 5, timestamp: 1700000004 },
  { userId: 'u002', movieId: 4,  rating: 4, timestamp: 1700000005 },
  { userId: 'u002', movieId: 6,  rating: 2, timestamp: 1700000006 },
 
  // Carlos Pérez (u003) → 3 películas
  { userId: 'u003', movieId: 7,  rating: 5, timestamp: 1700000007 },
  { userId: 'u003', movieId: 8,  rating: 4, timestamp: 1700000008 },
  { userId: 'u003', movieId: 1,  rating: 3, timestamp: 1700000009 },
 
  // Diana López (u004) → 3 películas
  { userId: 'u004', movieId: 9,  rating: 5, timestamp: 1700000010 },
  { userId: 'u004', movieId: 10, rating: 3, timestamp: 1700000011 },
  { userId: 'u004', movieId: 2,  rating: 4, timestamp: 1700000012 },
 
  // Eduardo Ramírez (u005) → 3 películas
  { userId: 'u005', movieId: 3,  rating: 4, timestamp: 1700000013 },
  { userId: 'u005', movieId: 6,  rating: 5, timestamp: 1700000014 },
  { userId: 'u005', movieId: 8,  rating: 2, timestamp: 1700000015 },
];

// Funciones para buscar usuario, película o Rating
async function findUser(userId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       RETURN u.name AS name, u.userId AS userId`,
      { userId: neo4j.int(userId) }
    );
    if (result.records.length === 0) {
      console.log(`[findUser] No existe usuario con userId: ${userId}`);
      return null;
    }
    const record = result.records[0];
    console.log(`[findUser] name: "${record.get('name')}" | userId: ${record.get('userId')}`);
    return { name: record.get('name'), userId: record.get('userId') };
  } catch (err) {
    console.error(`Error en findUser:`, err.message);
  } finally {
    await session.close();
  }
}

async function findMovie(movieId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {movieId: $movieId})
       RETURN m.title AS title, m.movieId AS movieId,
              m.year AS year, m.plot AS plot`,
      { movieId: neo4j.int(movieId) }
    );
    if (result.records.length === 0) {
      console.log(`[findMovie] No existe película con movieId: ${movieId}`);
      return null;
    }
    const record = result.records[0];
    console.log(`[findMovie] title: "${record.get('title')}" | year: ${record.get('year')} | movieId: ${record.get('movieId')}`);
    console.log(`              plot: "${record.get('plot')}"`);
    return {
      title:   record.get('title'),
      movieId: record.get('movieId'),
      year:    record.get('year'),
      plot:    record.get('plot'),
    };
  } catch (err) {
    console.error(`Error en findMovie:`, err.message);
  } finally {
    await session.close();
  }
}

async function findUserRatedMovie(userId, movieId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie {movieId: $movieId})
       RETURN
         u.name      AS userName,
         u.userId    AS userId,
         m.title     AS movieTitle,
         m.movieId   AS movieId,
         m.year      AS year,
         r.rating    AS rating,
         r.timestamp AS timestamp`,
      { userId: neo4j.int(userId), movieId: neo4j.int(movieId) }
    );
    if (result.records.length === 0) {
      console.log(`[findUserRatedMovie] No existe RATED entre userId: ${userId} y movieId: ${movieId}`);
      return null;
    }
    const record = result.records[0];
    const stars  = '⭐'.repeat(record.get('rating'));
    console.log(`\n [findUserRatedMovie] Relación encontrada:`);
    console.log(`   Usuario : "${record.get('userName')}" (${record.get('userId')})`);
    console.log(`   Película: "${record.get('movieTitle')}" (${record.get('year')})`);
    console.log(`   Rating  : ${record.get('rating')}/5  ${stars}`);
    console.log(`   Timestamp: ${record.get('timestamp')}`);
    return {
      userName:   record.get('userName'),
      movieTitle: record.get('movieTitle'),
      rating:     record.get('rating'),
      timestamp:  record.get('timestamp'),
    };
  } catch (err) {
    console.error(`Error en findUserRatedMovie:`, err.message);
  } finally {
    await session.close();
  }
}


// MAIN

async function main() {
 
  console.log(' LAB 08 ');
 
 
  // Verificar conexión
  try {
    await driver.verifyConnectivity();
    console.log(' Conexión exitosa con AuraDB\n');
  } catch (err) {
    console.error(' No se pudo conectar a AuraDB:', err.message);
    process.exit(1);
  }
 
  // Paso 1: Crear usuarios (MERGE = no duplica si ya existen de Persona 1)
  
  console.log(' Paso 1: Asegurando 5 usuarios en el grafo...');
  
  for (const u of USUARIOS) {
    await createUser(u.name, u.userId);
  }
 
  // Paso 2: Crear películas (MERGE = no duplica)
  
  console.log(' Paso 2: Asegurando 10 películas en el grafo...');
  
  for (const m of PELICULAS) {
    await createMovie(m.title, m.movieId, m.year, m.plot);
  }
 
  // Paso 3: Crear relaciones RATED
  
  console.log(' Paso 3: Creando relaciones RATED...');
  console.log(' (cada usuario ratea mínimo 2 películas)');
  
  for (const r of RATINGS) {
    await createRated(r.userId, r.movieId, r.rating, r.timestamp);
  }
 
  
  console.log('   15 relaciones :RATED creadas en AuraDB.');
  
 
  await driver.close();
}
 
main();

