import { useState } from "react";

const converterGroups = [
  {
    id: "power",
    title: "Power",
    initialValue: "1",
    initialUnit: "hp",
    formula: [
      "kW = (m^3 / hr x total head in meters x S.G.) / (367.87 x pump efficiency)",
      "BHP = (IMP.GPM x total head in ft x S.G. x 10) / (33,000 x pump efficiency)"
    ],
    units: {
      hp: {
        label: "HP",
        toBase: (value) => value * 0.75,
        fromBase: (value) => value / 0.75
      },
      kw: {
        label: "kW",
        toBase: (value) => value,
        fromBase: (value) => value
      }
    }
  },
  {
    id: "pressure",
    title: "Pressure",
    initialValue: "1",
    initialUnit: "pa",
    units: {
      pa: {
        label: "Pascal Pa (N/m^2)",
        toBase: (value) => value,
        fromBase: (value) => value
      },
      bar: {
        label: "Bar",
        toBase: (value) => value * 100000,
        fromBase: (value) => value / 100000
      },
      kgpcm2: {
        label: "Kg/cm^2",
        toBase: (value) => value * 98067,
        fromBase: (value) => value / 98067
      },
      mwc: {
        label: "Meter Water Column",
        toBase: (value) => value * 9806.7,
        fromBase: (value) => value / 9806.7
      },
      at: {
        label: "Technical atmosphere at (kg/cm^2)",
        toBase: (value) => value * 98067,
        fromBase: (value) => value / 98067
      },
      atm: {
        label: "Physical atmosphere atm",
        toBase: (value) => value * 101325,
        fromBase: (value) => value / 101325
      },
      psi: {
        label: "psi (lb/in^2)",
        toBase: (value) => value * 6895,
        fromBase: (value) => value / 6895
      }
    }
  },
  {
    id: "flow",
    title: "Flow",
    initialValue: "1",
    initialUnit: "lps",
    units: {
      lps: {
        label: "LPS (L/sec)",
        toBase: (value) => value,
        fromBase: (value) => value
      },
      lpm: {
        label: "LPM (L/min)",
        toBase: (value) => value / 60,
        fromBase: (value) => value * 60
      },
      cmh: {
        label: "CMH (m^3/hr)",
        toBase: (value) => value / 3.6,
        fromBase: (value) => value * 3.6
      },
      cfm: {
        label: "CFM (ft^3/min)",
        toBase: (value) => value / 2.119,
        fromBase: (value) => value * 2.119
      },
      cfh: {
        label: "CFH (ft^3/hr)",
        toBase: (value) => value / 127.1,
        fromBase: (value) => value * 127.1
      },
      usgpm: {
        label: "US GPM",
        toBase: (value) => value / 15.85,
        fromBase: (value) => value * 15.85
      },
      ukgpm: {
        label: "UK GPM",
        toBase: (value) => value / 13.185,
        fromBase: (value) => value * 13.185
      }
    }
  },
  {
    id: "temperature",
    title: "Temperature",
    initialValue: "0",
    initialUnit: "c",
    formula: [
      "K = 273.15 + deg C",
      "deg F = 32 + 1.8 x deg C"
    ],
    units: {
      c: {
        label: "Degrees Celsius (deg C)",
        toBase: (value) => value,
        fromBase: (value) => value
      },
      k: {
        label: "Kelvin (K)",
        toBase: (value) => value - 273.15,
        fromBase: (value) => value + 273.15
      },
      f: {
        label: "Degrees Fahrenheit (deg F)",
        toBase: (value) => (value - 32) / 1.8,
        fromBase: (value) => (value * 1.8) + 32
      }
    }
  },
  {
    id: "pump-head",
    title: "Pump Head",
    initialValue: "1",
    initialUnit: "meter",
    formula: [
      "1 meter = 3.28084 feet",
      "1 foot = 0.3048 meter"
    ],
    units: {
      meter: {
        label: "Meter (m)",
        toBase: (value) => value,
        fromBase: (value) => value
      },
      foot: {
        label: "Foot (ft)",
        toBase: (value) => value * 0.3048,
        fromBase: (value) => value / 0.3048
      }
    }
  }
];

const prefixRows = [
  ["10^9", "G", "giga"],
  ["10^6", "M", "mega"],
  ["10^3", "k", "kilo"],
  ["10^2", "h", "hekto"],
  ["10", "da", "deka"],
  ["10^-1", "d", "deci"],
  ["10^-2", "c", "centi"],
  ["10^-3", "m", "milli"],
  ["10^-6", "u", "micro"],
  ["10^-9", "n", "nano"]
];

const motorRows = [
  ["Maximum temperature rise by resistance", "75K", "80K", "100K", "125K"],
  ["Average temperature at 40 C ambient", "115 C", "120 C", "140 C", "165 C"],
  ["Limiting hot spot temperature", "120 C", "130 C", "155 C", "180 C"]
];

function formatValue(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  const absolute = Math.abs(value);
  if (absolute !== 0 && (absolute >= 1000000 || absolute < 0.001)) {
    return value.toExponential(4);
  }

  return Number(value.toFixed(6)).toString();
}

function ConverterCard({ group }) {
  const [value, setValue] = useState(group.initialValue);
  const [unitKey, setUnitKey] = useState(group.initialUnit);
  const numericValue = Number(value);
  const units = Object.entries(group.units);
  const selectedUnit = group.units[unitKey];
  const hasValidValue = Number.isFinite(numericValue);
  const baseValue = hasValidValue ? selectedUnit.toBase(numericValue) : null;

  return (
    <article className="panel">
      <header className="panel-header">
        <h2>{group.title}</h2>
      </header>
      <div className="panel-body">
        <div className="converter">
          <div className="field-row">
            <div>
              <label htmlFor={`${group.id}-value`}>Value</label>
              <input
                id={`${group.id}-value`}
                type="number"
                step="any"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`${group.id}-unit`}>Unit</label>
              <select
                id={`${group.id}-unit`}
                value={unitKey}
                onChange={(event) => setUnitKey(event.target.value)}
              >
                {units.map(([key, unit]) => (
                  <option key={key} value={key}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="results">
            {hasValidValue ? (
              units.map(([key, unit]) => (
                <div className="result-item" key={key}>
                  <strong>{unit.label}</strong>
                  <span>{formatValue(unit.fromBase(baseValue))}</span>
                </div>
              ))
            ) : (
              <div className="result-item">
                <strong>Invalid input</strong>
                <span>Enter a number.</span>
              </div>
            )}
          </div>
        </div>

        {group.formula ? (
          <div className="formula">
            {group.formula.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ReferenceTable({ title, description, headers, rows }) {
  return (
    <article className="table-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

export default function App() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-top">
          <div>
            <a
              className="hero-logo-link"
              href="https://www.hungpump.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Hung Pump Group website"
            >
              <img className="hero-logo" src="/hung-pump.png" alt="Hung Pump logo" />
            </a>
            <h1>Unit Converter</h1>
            <p>
              Hung Pump Group unit converter for power, pressure, flow, temperature, and pump head.
            </p>
          </div>
        </div>
      </section>

      <section className="grid">
        {converterGroups.map((group) => (
          <ConverterCard key={group.id} group={group} />
        ))}
      </section>

      <section className="reference">
        <ReferenceTable
          title="SI prefixes"
          description="Reference values from the PDF."
          headers={["Factor", "Symbol", "Prefix"]}
          rows={prefixRows}
        />
        <ReferenceTable
          title="Motor insulation class"
          description="Static reference table from the PDF."
          headers={["Class", "E", "B", "F", "H"]}
          rows={motorRows}
        />
      </section>

      <p className="footer">Hung Pump Group reserved the copyright.</p>
    </main>
  );
}
