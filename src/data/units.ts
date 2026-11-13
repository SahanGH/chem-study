export interface Topic {
  /** AP topic code, for example "5.2". */
  code: string;
  title: string;
}

export interface Unit {
  number: number;
  title: string;
  /** URL segment, for example "unit-5-kinetics". */
  slug: string;
  /** One sentence shown at the top of the unit page. */
  blurb: string;
  topics: Topic[];
}

function unit(number: number, title: string, slug: string, blurb: string, titles: string[]): Unit {
  return {
    number,
    title,
    slug: `unit-${number}-${slug}`,
    blurb,
    topics: titles.map((t, i) => ({ code: `${number}.${i + 1}`, title: t })),
  };
}

// Topic titles follow the 2024 AP Chemistry Course and Exam Description.
export const units: Unit[] = [
  unit(1, 'Atomic Structure and Properties', 'atomic-structure',
    'What atoms are made of, how we count them, and why the periodic table is shaped the way it is.', [
      'Moles and Molar Mass',
      'Mass Spectra of Elements',
      'Elemental Composition of Pure Substances',
      'Composition of Mixtures',
      'Atomic Structure and Electron Configuration',
      'Photoelectron Spectroscopy',
      'Periodic Trends',
      'Valence Electrons and Ionic Compounds',
    ]),
  unit(2, 'Compound Structure and Properties', 'compound-structure',
    'How atoms bond, and how the shape of a molecule follows from its electrons.', [
      'Types of Chemical Bonds',
      'Intramolecular Force and Potential Energy',
      'Structure of Ionic Solids',
      'Structure of Metals and Alloys',
      'Lewis Diagrams',
      'Resonance and Formal Charge',
      'VSEPR and Hybridization',
    ]),
  unit(3, 'Properties of Substances and Mixtures', 'substances-and-mixtures',
    'Why substances melt, boil, dissolve and absorb light the way they do: forces between particles.', [
      'Intermolecular and Interparticle Forces',
      'Properties of Solids',
      'Solids, Liquids, and Gases',
      'Ideal Gas Law',
      'Kinetic Molecular Theory',
      'Deviation from Ideal Gas Law',
      'Solutions and Mixtures',
      'Representations of Solutions',
      'Separation of Solutions and Mixtures',
      'Solubility',
      'Spectroscopy and the Electromagnetic Spectrum',
      'Properties of Photons',
      'Beer–Lambert Law',
    ]),
  unit(4, 'Chemical Reactions', 'chemical-reactions',
    'Writing, balancing and classifying reactions, and using them to calculate amounts.', [
      'Introduction for Reactions',
      'Net Ionic Equations',
      'Representations of Reactions',
      'Physical and Chemical Changes',
      'Stoichiometry',
      'Introduction to Titration',
      'Types of Chemical Reactions',
      'Introduction to Acid–Base Reactions',
      'Oxidation–Reduction (Redox) Reactions',
    ]),
  unit(5, 'Kinetics', 'kinetics',
    'How fast reactions go, what controls the speed, and what the speed reveals about the steps in between.', [
      'Reaction Rates',
      'Introduction to Rate Law',
      'Concentration Changes over Time',
      'Elementary Reactions',
      'Collision Model',
      'Reaction Energy Profile',
      'Introduction to Reaction Mechanisms',
      'Reaction Mechanism and Rate Law',
      'Pre-Equilibrium Approximation',
      'Multistep Reaction Energy Profile',
      'Catalysis',
    ]),
  unit(6, 'Thermochemistry', 'thermochemistry',
    'Where the energy of a reaction comes from, where it goes, and how to measure it.', [
      'Endothermic and Exothermic Processes',
      'Energy Diagrams',
      'Heat Transfer and Thermal Equilibrium',
      'Heat Capacity and Calorimetry',
      'Energy of Phase Changes',
      'Introduction to Enthalpy of Reaction',
      'Bond Enthalpies',
      'Enthalpy of Formation',
      "Hess's Law",
    ]),
  unit(7, 'Equilibrium', 'equilibrium',
    'Reactions that run both ways, where they settle, and how they respond when disturbed.', [
      'Introduction to Equilibrium',
      'Direction of Reversible Reactions',
      'Reaction Quotient and Equilibrium Constant',
      'Calculating the Equilibrium Constant',
      'Magnitude of the Equilibrium Constant',
      'Properties of the Equilibrium Constant',
      'Calculating Equilibrium Concentrations',
      'Representations of Equilibrium',
      "Introduction to Le Châtelier's Principle",
      "Reaction Quotient and Le Châtelier's Principle",
      'Introduction to Solubility Equilibria',
      'Common-Ion Effect',
    ]),
  unit(8, 'Acids and Bases', 'acids-and-bases',
    'pH, weak and strong acids, titrations and buffers: equilibrium applied to proton transfer.', [
      'Introduction to Acids and Bases',
      'pH and pOH of Strong Acids and Bases',
      'Weak Acid and Base Equilibria',
      'Acid–Base Reactions and Buffers',
      'Acid–Base Titrations',
      'Molecular Structure of Acids and Bases',
      'pH and pKa',
      'Properties of Buffers',
      'Henderson–Hasselbalch Equation',
      'Buffer Capacity',
      'pH and Solubility',
    ]),
  unit(9, 'Thermodynamics and Electrochemistry', 'thermodynamics',
    'Why some reactions happen on their own, and how to turn that tendency into electricity.', [
      'Introduction to Entropy',
      'Absolute Entropy and Entropy Change',
      'Gibbs Free Energy and Thermodynamic Favorability',
      'Thermodynamic and Kinetic Control',
      'Free Energy and Equilibrium',
      'Free Energy of Dissolution',
      'Coupled Reactions',
      'Galvanic (Voltaic) and Electrolytic Cells',
      'Cell Potential and Free Energy',
      'Cell Potential Under Nonstandard Conditions',
      "Electrolysis and Faraday's Law",
    ]),
];

export function unitBySlug(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug);
}

export function topicByCode(code: string): { unit: Unit; topic: Topic } | undefined {
  for (const unit of units) {
    const topic = unit.topics.find((t) => t.code === code);
    if (topic) return { unit, topic };
  }
  return undefined;
}
