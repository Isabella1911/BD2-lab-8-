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
      console.log(`[findMovie] No existe pelicula con movieId: ${movieId}`);
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
    const stars  = '*'.repeat(record.get('rating'));
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

//Funciones de creacion 

async function createPersonActor(name, tmdbId, born, died, bornIn, url, imdbId, bio, poster) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MERGE (p:Person:Actor {tmdbId: $tmdbId})
       ON CREATE SET
         p.name   = $name,
         p.born   = $born,
         p.died   = $died,
         p.bornIn = $bornIn,
         p.url    = $url,
         p.imdbId = $imdbId,
         p.bio    = $bio,
         p.poster = $poster
       RETURN p.name AS name, p.tmdbId AS tmdbId`,
      { name, tmdbId: neo4j.int(tmdbId), born, died, bornIn, url, imdbId: neo4j.int(imdbId), bio, poster }
    );
    const record = result.records[0];
    console.log(` [ACTOR]    name: "${record.get('name')}" | tmdbId: ${record.get('tmdbId')}`);
    return record;
  } catch (err) {
    console.error(` Error en createPersonActor:`, err.message);
  } finally {
    await session.close();
  }
}

async function createPersonDirector(name, tmdbId, born, died, bornIn, url, imdbId, bio, poster) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MERGE (p:Person:Director {tmdbId: $tmdbId})
       ON CREATE SET
         p.name   = $name,
         p.born   = $born,
         p.died   = $died,
         p.bornIn = $bornIn,
         p.url    = $url,
         p.imdbId = $imdbId,
         p.bio    = $bio,
         p.poster = $poster
       RETURN p.name AS name, p.tmdbId AS tmdbId`,
      { name, tmdbId: neo4j.int(tmdbId), born, died, bornIn, url, imdbId: neo4j.int(imdbId), bio, poster }
    );
    const record = result.records[0];
    console.log(` [DIRECTOR] name: "${record.get('name')}" | tmdbId: ${record.get('tmdbId')}`);
    return record;
  } catch (err) {
    console.error(` Error en createPersonDirector:`, err.message);
  } finally {
    await session.close();
  }
}

async function createGenre(name) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MERGE (g:Genre {name: $name})
       RETURN g.name AS name`,
      { name }
    );
    const record = result.records[0];
    console.log(` [GENRE]    name: "${record.get('name')}"`);
    return record;
  } catch (err) {
    console.error(` Error en createGenre:`, err.message);
  } finally {
    await session.close();
  }
}

async function createActedIn(tmdbId, movieId, role) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Actor {tmdbId: $tmdbId})
       MATCH (m:Movie {movieId: $movieId})
       MERGE (p)-[r:ACTED_IN]->(m)
       ON CREATE SET r.role = $role
       RETURN p.name AS actorName, m.title AS movieTitle, r.role AS role`,
      { tmdbId: neo4j.int(tmdbId), movieId: neo4j.int(movieId), role }
    );
    const record = result.records[0];
    if (record) {
      console.log(` [ACTED_IN] "${record.get('actorName')}" → "${record.get('movieTitle')}" | role: "${record.get('role')}"`);
    }
    return record;
  } catch (err) {
    console.error(` Error en createActedIn:`, err.message);
  } finally {
    await session.close();
  }
}

async function createDirected(tmdbId, movieId, role) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Director {tmdbId: $tmdbId})
       MATCH (m:Movie {movieId: $movieId})
       MERGE (p)-[r:DIRECTED]->(m)
       ON CREATE SET r.role = $role
       RETURN p.name AS directorName, m.title AS movieTitle, r.role AS role`,
      { tmdbId: neo4j.int(tmdbId), movieId: neo4j.int(movieId), role }
    );
    const record = result.records[0];
    if (record) {
      console.log(`🎬 [DIRECTED] "${record.get('directorName')}" → "${record.get('movieTitle')}" | role: "${record.get('role')}"`);
    }
    return record;
  } catch (err) {
    console.error(` Error en createDirected:`, err.message);
  } finally {
    await session.close();
  }
}

async function createInGenre(movieId, genreName) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {movieId: $movieId})
       MATCH (g:Genre {name: $genreName})
       MERGE (m)-[:IN_GENRE]->(g)
       RETURN m.title AS movieTitle, g.name AS genre`,
      { movieId: neo4j.int(movieId), genreName }
    );
    const record = result.records[0];
    if (record) {
      console.log(`  [IN_GENRE] "${record.get('movieTitle')}" → "${record.get('genre')}"`);
    }
    return record;
  } catch (err) {
    console.error(` Error en createInGenre:`, err.message);
  } finally {
    await session.close();
  }
}
// Datos
const ACTORES = [
  {
    name: 'Leonardo DiCaprio', tmdbId: 6193,
    born: '1974-11-11', died: null, bornIn: 'Los Angeles, USA',
    url: 'https://www.themoviedb.org/person/6193',
    imdbId: 138, bio: 'Actor y productor estadounidense ganador del Oscar.',
    poster: 'https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg'
  },
  {
    name: 'Christian Bale', tmdbId: 3894,
    born: '1974-01-30', died: null, bornIn: 'Haverfordwest, Wales',
    url: 'https://www.themoviedb.org/person/3894',
    imdbId: 36801, bio: 'Actor galés conocido por su transformación física.',
    poster: 'https://image.tmdb.org/t/p/w500/qCpZn2e3dimwbryLnqxZuI88PTi.jpg'
  },
  {
    name: 'Matthew McConaughey', tmdbId: 10297,
    born: '1969-11-04', died: null, bornIn: 'Uvalde, Texas, USA',
    url: 'https://www.themoviedb.org/person/10297',
    imdbId: 190281, bio: 'Actor texano ganador del Oscar por Dallas Buyers Club.',
    poster: 'https://image.tmdb.org/t/p/w500/wJiGedOCZhwMx9DezY8uwbNxmAY.jpg'
  },
  {
    name: 'Tom Hanks', tmdbId: 31,
    born: '1956-07-09', died: null, bornIn: 'Concord, California, USA',
    url: 'https://www.themoviedb.org/person/31',
    imdbId: 158, bio: 'Actor y director estadounidense dos veces ganador del Oscar.',
    poster: 'https://image.tmdb.org/t/p/w500/xndWFsBlClOJFRdhSt4NBwiPq2o.jpg'
  },
  {
    name: 'Song Kang-ho', tmdbId: 21684,
    born: '1967-01-17', died: null, bornIn: 'Gimhae, South Korea',
    url: 'https://www.themoviedb.org/person/21684',
    imdbId: 176690, bio: 'Actor surcoreano, uno de los más reconocidos del cine asiático.',
    poster: 'https://image.tmdb.org/t/p/w500/qD55khE6msR6hD5SZsW0bFQQ6Ow.jpg'
  },
];

const DIRECTORES = [
  {
    name: 'Christopher Nolan', tmdbId: 525,
    born: '1970-07-30', died: null, bornIn: 'London, UK',
    url: 'https://www.themoviedb.org/person/525',
    imdbId: 634240, bio: 'Director británico-estadounidense conocido por narrativas no lineales.',
    poster: 'https://image.tmdb.org/t/p/w500/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg'
  },
  {
    name: 'Robert Zemeckis', tmdbId: 24,
    born: '1952-05-14', died: null, bornIn: 'Chicago, Illinois, USA',
    url: 'https://www.themoviedb.org/person/24',
    imdbId: 924367, bio: 'Director y guionista estadounidense conocido por Forrest Gump y Back to the Future.',
    poster: 'https://image.tmdb.org/t/p/w500/5amFiDPHMFOnGxFXEYZJKoiqZpZ.jpg'
  },
  {
    name: 'Bong Joon-ho', tmdbId: 21684,
    born: '1969-09-14', died: null, bornIn: 'Daegu, South Korea',
    url: 'https://www.themoviedb.org/person/109PRQ',
    imdbId: 1280592, bio: 'Director surcoreano ganador del Oscar por Parasite.',
    poster: 'https://image.tmdb.org/t/p/w500/oVANns64bDDrRFbMnQnH0gHLJc1.jpg'
  },
];

const GENEROS = ['Action', 'Sci-Fi', 'Drama', 'Thriller', 'Adventure', 'Comedy'];

const ACTED_IN_RELS = [
  { tmdbId: 6193,  movieId: 1, role: 'Dom Cobb' },
  { tmdbId: 3894,  movieId: 2, role: 'Bruce Wayne / Batman' },
  { tmdbId: 10297, movieId: 3, role: 'Cooper' },
  { tmdbId: 31,    movieId: 4, role: 'Forrest Gump' },
  { tmdbId: 21684, movieId: 5, role: 'Ki-taek' },
];

const DIRECTED_RELS = [
  { tmdbId: 525,   movieId: 1, role: 'Director' },
  { tmdbId: 525,   movieId: 2, role: 'Director' },
  { tmdbId: 525,   movieId: 3, role: 'Director' },
  { tmdbId: 24,    movieId: 4, role: 'Director' },
  { tmdbId: 21684, movieId: 5, role: 'Director' },
];

const IN_GENRE_RELS = [
  { movieId: 1, genreName: 'Sci-Fi'    },
  { movieId: 1, genreName: 'Thriller'  },
  { movieId: 2, genreName: 'Action'    },
  { movieId: 2, genreName: 'Drama'     },
  { movieId: 3, genreName: 'Sci-Fi'    },
  { movieId: 3, genreName: 'Adventure' },
  { movieId: 4, genreName: 'Drama'     },
  { movieId: 4, genreName: 'Comedy'    },
  { movieId: 5, genreName: 'Thriller'  },
  { movieId: 5, genreName: 'Drama'     },
];

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

 //grafo extendido 

 console.log('\n── Creando actores (Person:Actor) ──');
  for (const a of ACTORES) {
    await createPersonActor(
      a.name, a.tmdbId, a.born, a.died,
      a.bornIn, a.url, a.imdbId, a.bio, a.poster
    );
  }

  console.log('\n── Creando directores (Person:Director) ──');
  for (const d of DIRECTORES) {
    await createPersonDirector(
      d.name, d.tmdbId, d.born, d.died,
      d.bornIn, d.url, d.imdbId, d.bio, d.poster
    );
  }

  console.log('\n── Creando géneros ──');
  for (const g of GENEROS) {
    await createGenre(g);
  }

  console.log('\n── Creando relaciones ACTED_IN ──');
  for (const r of ACTED_IN_RELS) {
    await createActedIn(r.tmdbId, r.movieId, r.role);
  }

  console.log('\n── Creando relaciones DIRECTED ──');
  for (const r of DIRECTED_RELS) {
    await createDirected(r.tmdbId, r.movieId, r.role);
  }

  console.log('\n── Creando relaciones IN_GENRE ──');
  for (const r of IN_GENRE_RELS) {
    await createInGenre(r.movieId, r.genreName);
  }


  await driver.close();

}
 
main();

