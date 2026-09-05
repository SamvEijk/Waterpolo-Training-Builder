# Waterplan

Lokale MVP voor waterpolotrainers: oefeningen beheren, Word-bestanden importeren, trainingen samenstellen en naar Word exporteren.

## Starten

Gebruik Node 22+ en voer `pnpm install` uit. Start vervolgens met `pnpm dev` en open de getoonde lokale URL.

Er zijn vijf voorbeeld-oefeningen. In deze lokale demonstratie bewaart de interface gegevens in de browser; het D1/SQLite-schema en de migratie in `drizzle/` zijn voorbereid voor serveropslag.

## Word-importformaat

Gebruik bij voorkeur blokken die beginnen met `Oefening: Naam`, gevolgd door regels zoals `Duur: 10 minuten`, `Categorie: Techniek`, `Doel: ...` en de omschrijving. De importpagina toont altijd een controlelijst voor opslaan.
