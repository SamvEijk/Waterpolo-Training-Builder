'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import {
  Download,
  FileUp,
  Plus,
  Printer,
  Search,
  Trash2,
  Waves,
  X,
} from 'lucide-react';
type E = {
  id: string;
  title: string;
  category: string;
  duration: number;
  players: string;
  equipment: string;
  goal: string;
  description: string;
};
type T = { id: string; title: string; date: string; exerciseIds: string[] };
const seed: E[] = [
  {
    id: '1',
    title: 'Warming-up met bal',
    category: 'Warming-up',
    duration: 10,
    players: '8–16',
    equipment: '1 bal per 2 spelers',
    goal: 'Balgevoel en mobiliteit',
    description:
      'Rustig inzwemmen, passen in tweetallen en geleidelijk tempo verhogen.',
  },
  {
    id: '2',
    title: 'Driehoekspassen onder druk',
    category: 'Baloefeningen · Passen',
    duration: 12,
    players: '6–12',
    equipment: '3 ballen',
    goal: 'Passen op tempo',
    description:
      'Maak driehoeken. Verdediger probeert de passlijn te sluiten; wissel na 90 seconden.',
  },
  {
    id: '3',
    title: '4 tegen 3 omschakeling',
    category: 'Baloefeningen · Aanval',
    duration: 15,
    players: '7–12',
    equipment: '2 doelen, ballen',
    goal: 'Snelle keuzes in overtal',
    description:
      'Start na onderschepping. Vier aanvallers zoeken direct de vrije speler tegen drie verdedigers.',
  },
  {
    id: '4',
    title: 'Blok en help-side',
    category: 'Baloefeningen · Verdediging',
    duration: 12,
    players: '8–14',
    equipment: 'Ballen',
    goal: 'Samen verdedigen',
    description: 'Oefen uitstappen, blokken en terugvallen naar de help-side.',
  },
  {
    id: '5',
    title: 'Man-meer 6 tegen 5',
    category: 'Baloefeningen · Man-meer',
    duration: 15,
    players: '11–14',
    equipment: 'Doelen, ballen',
    goal: 'Afronden vanuit posities',
    description:
      'Speel 6 tegen 5 met maximaal twee balcontacten; wissel verdediging iedere aanval.',
  },
];
const cats = [
  'Alle',
  'Warming-up',
  'Zwemmen',
  'Baloefeningen · Passen',
  'Baloefeningen · Aanval',
  'Baloefeningen · Verdediging',
  'Baloefeningen · Man-meer',
  'Baloefeningen · Partijvorm',
];
const blank = (): E => ({
  id: crypto.randomUUID(),
  title: '',
  category: 'Baloefeningen · Passen',
  duration: 10,
  players: '',
  equipment: '',
  goal: '',
  description: '',
});
const lane = (c: string) =>
  c === 'Warming-up'
    ? 'Warming-up'
    : c === 'Zwemmen'
      ? 'Zwemmen'
      : 'Baloefeningen';
const refId = (x: string) => x.split('|')[0];
const refDuration = (x: string, e: E) => Number(x.split('|')[1]) || e.duration;
const refMeters = (x: string) => Number(x.split('|')[2]) || 0;
const item = (e: E, d = e.duration, meters = 0) => `${e.id}|${d}|${meters}`;
const isSwimming = (text: string) => /\b(zwem|borstcrawl|rugcrawl|\bbc\b|\brc\b|o\s*&\s*o|om\s+en\s+om|benen|sprongen\s+(?:voorwaarts|zijwaarts)|crawl|schoolslag|vlinder(?:slag)?|rugslag)\b/i.test(text);
function parse(text: string) {
  const chunks = text
    .split(/(?=\b(?:Oefening|Titel|Naam)\s*[:\-])/i)
    .filter(Boolean);
  return (chunks.length > 1 ? chunks : text.split(/\n\s*\n+/))
    .filter((x) => x.trim().length > 20)
    .map((s) => {
      const get = (n: string) =>
        new RegExp(n + '\\s*[:\\-]\\s*([^\\n]+)', 'i').exec(s)?.[1]?.trim() ||
        '';
      const title = get('(?:Oefening|Titel|Naam)') || s.split('\n')[0];
      const distance = Number(
        `${title} ${s}`.match(/\b(\d{2,4})\s*(?:m|meter)\b/i)?.[1] || 0,
      );
      const explicit = Number(get('(?:Duur|Tijd)').match(/\d+/)?.[0] || 0);
      const category =
        get('Categorie') ||
        (isSwimming(`${title} ${s}`) ? 'Zwemmen' : 'Baloefeningen · Passen');
      return {
        id: crypto.randomUUID(),
        title,
        category,
        duration: explicit || Math.max(3, Math.ceil(distance / 25)),
        players: get('(?:Spelers|Aantal spelers)') || '—',
        equipment: get('(?:Materiaal|Benodigdheden)') || '—',
        goal: get('(?:Doel|Leerdoel)') || 'Waterpolotechniek',
        description: s,
      };
    })
    .filter((x) => x.title.length > 1);
}
export default function Home() {
  const [tab, setTab] = useState<'library' | 'builder' | 'import'>('library');
  const [ex, setEx] = useState<E[]>(seed);
  const [tr, setTr] = useState<T[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Alle');
  const [edit, setEdit] = useState<E | null>(null);
  const [draft, setDraft] = useState<T>({
    id: crypto.randomUUID(),
    title: 'Training vrijdag',
    date: new Date().toISOString().slice(0, 10),
    exerciseIds: [],
  });
  const [imports, setImports] = useState<E[]>([]);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const a = localStorage.getItem('waterplan-exercises'),
      b = localStorage.getItem('waterplan-trainings');
    if (a) setEx(JSON.parse(a));
    if (b) setTr(JSON.parse(b));
  }, []);
  useEffect(
    () => localStorage.setItem('waterplan-exercises', JSON.stringify(ex)),
    [ex],
  );
  useEffect(
    () => localStorage.setItem('waterplan-trainings', JSON.stringify(tr)),
    [tr],
  );
  const shown = useMemo(
    () =>
      ex.filter(
        (e) =>
          (cat === 'Alle' || e.category === cat) &&
          `${e.title} ${e.goal} ${e.description}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [ex, cat, q],
  );
  const chosen = draft.exerciseIds
    .map((raw) => {
      const e = ex.find((x) => x.id === refId(raw));
      return e ? { ...e, plannedDuration: refDuration(raw, e), swimMeters: refMeters(raw), raw } : null;
    })
    .filter(Boolean) as (E & { plannedDuration: number; swimMeters: number; raw: string })[];
  const total = chosen.reduce((n, e) => n + e.plannedDuration, 0);
  const save = () => {
    if (!edit?.title.trim()) return;
    setEx((a) =>
      a.some((e) => e.id === edit.id)
        ? a.map((e) => (e.id === edit.id ? edit : e))
        : [...a, edit],
    );
    setEdit(null);
  };
  const upload = async (f: File) => {
    const m = await import('mammoth/mammoth.browser');
    const r = await m.extractRawText({ arrayBuffer: await f.arrayBuffer() });
    setImports(parse(r.value));
    setTab('import');
  };
  const word = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: draft.title, heading: HeadingLevel.TITLE }),
            new Paragraph(
              `Datum: ${draft.date} · Totale duur: ${total} minuten`,
            ),
            ...chosen.flatMap((e, i) => [
              new Paragraph({
                text: `${i + 1}. ${e.title} — ${e.plannedDuration} min${e.swimMeters ? ` · ${e.swimMeters} meter` : ''}`,
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph(e.description),
              new Paragraph(
                `Doel: ${e.goal} | Spelers: ${e.players} | Materiaal: ${e.equipment}`,
              ),
            ]),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc),
      a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${draft.title}.docx`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <main className="min-h-screen bg-[#f4f8fa] text-slate-900">
      <header className="no-print border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 text-white">
              <Waves size={23} />
            </span>
            <div>
              <b className="text-lg">Waterplan</b>
              <p className="text-xs text-slate-500">Voor waterpolotrainers</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {(
              [
                ['library', 'Oefeningen'],
                ['builder', 'Training maken'],
                ['import', 'Word import'],
              ] as const
            ).map(([x, l]) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === x ? 'bg-sky-100 text-sky-800' : 'text-slate-600'}`}
              >
                {l}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8">
        {tab === 'library' && (
          <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">OEFENINGENBIBLIOTHEEK</p>
                <h1>Alles voor je volgende training</h1>
                <p className="muted">{ex.length} oefeningen opgeslagen</p>
              </div>
              <button className="primary" onClick={() => setEdit(blank())}>
                <Plus size={18} />
                Nieuwe oefening
              </button>
            </div>
            <div className="mb-5 flex flex-wrap gap-3">
              <label className="search">
                <Search size={18} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Zoek op naam, doel of omschrijving"
                />
              </label>
              <select value={cat} onChange={(e) => setCat(e.target.value)}>
                {cats.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="category-slider" aria-label="Filter oefeningen per categorie">
              {cats.map((x) => <button key={x} onClick={() => setCat(x)} className={cat === x ? 'active' : ''}>{x}</button>)}
            </div>
            <section className="cards">
              {shown.map((e) => (
                <article className="exercise" key={e.id}>
                  <div className="flex justify-between">
                    <span className="tag">{e.category}</span>
                    <span className="duration">{e.duration} min</span>
                  </div>
                  <h2>{e.title}</h2>
                  <p>{e.description}</p>
                  <div className="meta">
                    {e.players} spelers · {e.equipment}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="small"
                      onClick={() => {
                        setDraft((d) => ({
                          ...d,
                          exerciseIds: [...d.exerciseIds, item(e)],
                        }));
                        setTab('builder');
                      }}
                    >
                      + Aan training
                    </button>
                    <button className="icon" onClick={() => setEdit(e)}>
                      Bewerk
                    </button>
                    <button
                      className="icon danger"
                      onClick={() =>
                        setEx((a) => a.filter((x) => x.id !== e.id))
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
        {tab === 'import' && (
          <>
            <div className="mb-7">
              <p className="eyebrow">WORD-IMPORT</p>
              <h1>Oefeningen uit een document</h1>
              <p className="muted">
                Upload een .docx-bestand; controleer de herkende oefeningen voor
                je ze opslaat.
              </p>
            </div>
            <div className="upload" onClick={() => ref.current?.click()}>
              <FileUp size={30} />
              <b>Kies een Word-bestand</b>
              <span>
                .docx · meerdere oefeningen worden automatisch gescheiden
              </span>
              <input
                ref={ref}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && upload(e.target.files[0])
                }
              />
            </div>
            {imports.length > 0 && (
              <section className="import-list">
                <div className="flex items-center justify-between">
                  <h2>{imports.length} oefeningen herkend</h2>
                  <button
                    className="primary"
                    onClick={() => {
                      setEx((x) => [...x, ...imports]);
                      setImports([]);
                      setTab('library');
                    }}
                  >
                    Importeer oefeningen
                  </button>
                </div>
                {imports.map((e, i) => (
                  <div className="import-row" key={e.id}>
                    <input type="checkbox" defaultChecked />
                    <div>
                      <b>
                        {i + 1}. {e.title}
                      </b>
                      <p>
                        {e.duration} min · {e.category} ·{' '}
                        {e.description.slice(0, 100)}
                      </p>
                    </div>
                    <button
                      className="icon"
                      onClick={() =>
                        setImports((x) => x.filter((a) => a.id !== e.id))
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
        {tab === 'builder' && (
          <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">TRAININGBOUWER</p>
                <input
                  className="title-input"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
                <p className="muted">
                  {total} minuten · {chosen.length} onderdelen
                </p>
              </div>
              <div className="flex gap-2">
                <button className="secondary" onClick={() => print()}>
                  <Printer size={17} />
                  Print
                </button>
                <button className="primary" onClick={word}>
                  <Download size={17} />
                  Word export
                </button>
              </div>
            </div>
            <div className="builder">
              <section className="builder-list">
                <h2>Training</h2>
                {chosen.length === 0 ? (
                  <div className="empty">
                    Kies oefeningen uit de bibliotheek om je training op te
                    bouwen.
                  </div>
                ) : (
                  chosen.map((e, i) => (
                    <div className="plan" key={`${e.id}-${i}`}>
                      <span className="number">{i + 1}</span>
                      <div className="flex-1">
                        <b>{e.title}</b>
                        <p>{e.goal}</p>
                        {e.category === 'Zwemmen' && (
                          <label className="swim-meters">
                            Afstand
                            <input
                              aria-label={`Afstand ${e.title} in meters`}
                              type="number"
                              min="25"
                              step="25"
                              placeholder="bijv. 200"
                              value={e.swimMeters || ''}
                              onChange={(event) => {
                                const meters = Math.max(0, +event.target.value || 0);
                                setDraft((d) => ({
                                  ...d,
                                  exerciseIds: d.exerciseIds.map((raw, n) =>
                                    n === i ? item(e, meters ? Math.max(1, Math.ceil(meters / 25)) : e.plannedDuration, meters) : raw,
                                  ),
                                }));
                              }}
                            /> meter <small>(stappen van 25)</small>
                          </label>
                        )}
                      </div>
                      <label className="planned-time">
                        <input
                          aria-label={`Geplande duur ${e.title}`}
                          type="number"
                          min="1"
                          value={e.plannedDuration}
                          onChange={(event) =>
                            setDraft((d) => ({
                              ...d,
                              exerciseIds: d.exerciseIds.map((raw, n) =>
                                n === i ? item(e, Math.max(1, +event.target.value || 1), e.swimMeters) : raw,
                              ),
                            }))
                          }
                        /> min
                      </label>
                      <button
                        className="icon"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            exerciseIds: d.exerciseIds.filter(
                              (_, n) => n !== i,
                            ),
                          }))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
                <div className="total">
                  Totale training <b>{total} min</b>
                </div>
                <button
                  className="primary w-full"
                  onClick={() =>
                    setTr((a) => [...a, { ...draft, id: crypto.randomUUID() }])
                  }
                >
                  Training opslaan
                </button>
              </section>
              <aside className="picker">
                <h2>Voeg oefeningen toe</h2>
                {['Warming-up', 'Zwemmen', 'Baloefeningen'].map((group) => (
                  <div className="exercise-group" key={group}>
                    <h3>{group}</h3>
                    {ex.filter((e) => lane(e.category) === group).map((e) => (
                      <button key={e.id} className="pick" onClick={() => setDraft((d) => ({ ...d, exerciseIds: [...d.exerciseIds, item(e)] }))}>
                        <span><b>{e.title}</b><small>{e.category.replace('Baloefeningen · ', '')}</small></span>
                        <span>{e.duration} min</span><Plus size={16} />
                      </button>
                    ))}
                  </div>
                ))}
              </aside>
            </div>
            {tr.length > 0 && (
              <p className="muted mt-5">{tr.length} training(en) opgeslagen.</p>
            )}
          </>
        )}
      </div>
      {edit && (
        <div className="modal">
          <form
            className="dialog"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="flex justify-between">
              <h2>Oefening</h2>
              <button
                type="button"
                className="icon"
                onClick={() => setEdit(null)}
              >
                <X />
              </button>
            </div>
            {(
              [
                ['title', 'Naam'],
                ['goal', 'Doel'],
                ['players', 'Spelers'],
                ['equipment', 'Materiaal'],
                ['description', 'Omschrijving'],
              ] as const
            ).map(([k, l]) => (
              <label key={k}>
                {l}
                {k === 'description' ? (
                  <textarea
                    rows={4}
                    value={edit[k]}
                    onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
                  />
                ) : (
                  <input
                    value={edit[k]}
                    onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
                  />
                )}
              </label>
            ))}
            <div className="two">
              <label>
                Categorie
                <select
                  value={edit.category}
                  onChange={(e) =>
                    setEdit({ ...edit, category: e.target.value })
                  }
                >
                  {cats.slice(1).map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Duur
                <input
                  type="number"
                  value={edit.duration}
                  onChange={(e) =>
                    setEdit({ ...edit, duration: +e.target.value })
                  }
                />
              </label>
            </div>
            <button className="primary">Oefening opslaan</button>
          </form>
        </div>
      )}
    </main>
  );
}
