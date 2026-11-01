/* Club logo row on the home page (swipeable, 3 at a time on phones).
   - name:  shown under the logo
   - logo:  file inside /public/club-logos/
   - match: lower-case words; the logo links to the shop for that club only when a product in the
            catalogue has a club name containing one of these words (so there are no empty pages).
   Only use logos you have the right to use. */
export const CLUB_LOGOS = [
  { name: "Real Madrid", logo: "real-madrid.webp", match: ["real madrid"] },
  { name: "Barcelona", logo: "barcelona.webp", match: ["barcelona", "barca"] },
  { name: "Atlético Madrid", logo: "atletico-madrid.webp", match: ["atletico"] },
  { name: "Sevilla", logo: "sevilla.webp", match: ["sevilla"] },
  { name: "Valencia", logo: "valencia.webp", match: ["valencia"] },
  { name: "Villarreal", logo: "villarreal.webp", match: ["villarreal"] },
  { name: "Real Betis", logo: "real-betis.webp", match: ["betis"] },
  { name: "Athletic Club", logo: "athletic-club.webp", match: ["athletic"] },
  { name: "Real Sociedad", logo: "real-sociedad.webp", match: ["sociedad"] },
  { name: "Celta Vigo", logo: "celta-vigo.webp", match: ["celta"] },
  { name: "Getafe", logo: "getafe.webp", match: ["getafe"] },
  { name: "Osasuna", logo: "osasuna.webp", match: ["osasuna"] },
  { name: "Rayo Vallecano", logo: "rayo-vallecano.webp", match: ["rayo"] },
  { name: "Espanyol", logo: "espanyol.webp", match: ["espanyol"] },
  { name: "Levante", logo: "levante.webp", match: ["levante"] },
  { name: "Elche", logo: "elche.webp", match: ["elche"] },
  { name: "Alavés", logo: "alaves.webp", match: ["alaves"] },
  { name: "Málaga", logo: "malaga.webp", match: ["malaga"] },
  { name: "Deportivo", logo: "deportivo.webp", match: ["deportivo", "coruna"] },
  { name: "Racing Santander", logo: "racing-santander.webp", match: ["racing"] },
];
