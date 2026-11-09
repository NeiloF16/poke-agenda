#!/usr/bin/env node
/**
 * Source canonique : catalogue.json (23 jeux et 90 guides).
 * Génère le snapshot JS utilisable hors connexion sur GitHub Pages.
 * Usage : node scripts/build-calendar-data.mjs [--check]
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "catalogue.json");
const destination = resolve(root, "assets/calendar/games.js");
const games = JSON.parse(await readFile(source, "utf8"));
if (!Array.isArray(games) || games.length !== 23) {
  throw new Error("Le catalogue doit contenir exactement 23 jeux/duos (Pokémon GO inclus).");
}
const seen = new Set();
for (const game of games) {
  if (!Number.isInteger(game.id) || game.id < 1 || game.id > 23 || seen.has(game.id)) {
    throw new Error("Identifiant de jeu invalide ou dupliqué : " + game.id);
  }
  seen.add(game.id);
  if (typeof game.name !== "string" || !game.name.trim() ||
      typeof game.cover !== "string" || !/^assets\/covers\/[\w.-]+\.webp(?:\?v=[\w.-]+)?$/.test(game.cover) ||
      !Array.isArray(game.pages) || !game.pages.length ||
      !game.pages.every(page => typeof page.label === "string" &&
        /^assets\/pages\/[\w.-]+\.png$/.test(page.src))) {
    throw new Error("Métadonnées ou ressources invalides : jeu " + game.id);
  }
}
const header = `/* Poké Agenda V4.1 — catalogue généré depuis catalogue.json.
 * Ne pas éditer ce fichier : exécuter node scripts/build-calendar-data.mjs.
 * Le calendrier reste utilisable sans API externe ni réseau.
 */
`;
const output = header + "window.POKE_AGENDA_GAMES = " + JSON.stringify(games) + ";\\n";
if (process.argv.includes("--check")) {
  const current = await readFile(destination, "utf8");
  if (current !== output) {
    throw new Error("assets/calendar/games.js est périmé : relancer node scripts/build-calendar-data.mjs");
  }
  console.log("Catalogue synchronisé : " + games.length + " jeux, " +
    games.reduce((sum, game) => sum + game.pages.length, 0) + " guides.");
} else {
  await writeFile(destination, output, "utf8");
  console.log("Catalogue JS généré depuis catalogue.json.");
}
