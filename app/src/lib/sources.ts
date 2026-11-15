/**
 * Every outside source the app's numbers and explanations rest on.
 * Reference them by id from `indicators.ts`, `guides.ts` and friends; the Guides screen lists them.
 * Keep docs/SUBMISSION.md (NASA Data + Other References) in step with this file.
 */
export interface SourceRef {
  org: string;
  title: string;
  url: string;
  nasa?: boolean;
}

export const SOURCES = {
  hrpHazards: { org: 'NASA Human Research Program', title: '5 Hazards of Human Spaceflight', url: 'https://www.nasa.gov/hrp/hazards/', nasa: true },
  hrpRisks: { org: 'NASA', title: 'Human System Risks', url: 'https://www.nasa.gov/hhp/human-system-risks/', nasa: true },
  std3001: { org: 'NASA', title: 'NASA-STD-3001 Volume 1: Crew Health', url: 'https://www.nasa.gov/reference/nasa-std-3001v1/', nasa: true },
  osdrSkin: { org: 'NASA Open Science Data Repository', title: 'Mouse skin after spaceflight: OSD-238, OSD-239 (JAXA MHU-2), OSD-240, OSD-241 (RR-5), OSD-254 (RR-7)', url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-238', nasa: true },
  donki: { org: 'NASA CCMC', title: 'DONKI: Space Weather Database Of Notifications, Knowledge, Information', url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/', nasa: true },
  nasaShelter: { org: 'NASA Science', title: 'How NASA Will Protect Astronauts From Space Radiation at the Moon', url: 'https://science.nasa.gov/science-research/heliophysics/how-nasa-will-protect-astronauts-from-space-radiation-at-the-moon', nasa: true },
  skinPaper: { org: 'Communications Medicine (2024)', title: 'Transcriptomics analysis reveals molecular alterations underpinning spaceflight dermatology', url: 'https://doi.org/10.1038/s43856-024-00532-9' },
  crucian2016: { org: 'Crucian et al., Int J Gen Med (2016)', title: 'Incidence of clinical symptoms during long-duration orbital spaceflight', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5098747/' },
  barger2014: { org: 'Barger et al., Lancet Neurology (2014)', title: 'Prevalence of sleep deficiency and use of hypnotic drugs in astronauts', url: 'https://doi.org/10.1016/S1474-4422(14)70122-X' },
  rooney2019: { org: 'Rooney et al., Frontiers in Microbiology (2019)', title: 'Herpes virus reactivation in astronauts during spaceflight', url: 'https://doi.org/10.3389/fmicb.2019.00016' },
  boneMeta2020: { org: 'Stavnichuk et al., npj Microgravity (2020)', title: 'A systematic review and meta-analysis of bone loss in space travelers', url: 'https://doi.org/10.1038/s41526-020-0103-2' },
  zwart2014: { org: 'Zwart et al., Aviat Space Environ Med (2014)', title: 'Body mass changes during long-duration spaceflight', url: 'https://pubmed.ncbi.nlm.nih.gov/25197887/' },
  zeitlin2013: { org: 'Zeitlin et al., Science (2013)', title: 'Measurements of energetic particle radiation in transit to Mars on the Mars Science Laboratory', url: 'https://doi.org/10.1126/science.1235989' },
  ahaBp: { org: 'American Heart Association', title: 'Understanding Blood Pressure Readings', url: 'https://www.heart.org/bplevels' },
  mlPulse: { org: 'MedlinePlus (US National Library of Medicine)', title: 'Pulse', url: 'https://medlineplus.gov/ency/article/003399.htm' },
  mlSpo2: { org: 'MedlinePlus (US National Library of Medicine)', title: 'Pulse Oximetry', url: 'https://medlineplus.gov/lab-tests/pulse-oximetry/' },
  mlTemp: { org: 'MedlinePlus (US National Library of Medicine)', title: 'Body temperature norms', url: 'https://medlineplus.gov/ency/article/001982.htm' },
  mlFever: { org: 'MedlinePlus (US National Library of Medicine)', title: 'Fever', url: 'https://medlineplus.gov/ency/article/003090.htm' },
  aadAbcde: { org: 'American Academy of Dermatology', title: 'What to look for: ABCDEs of melanoma', url: 'https://www.aad.org/public/diseases/skin-cancer/find/at-risk/abcdes' },
} satisfies Record<string, SourceRef>;

export type SourceId = keyof typeof SOURCES;
