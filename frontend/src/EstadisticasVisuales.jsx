import React from 'react';
import {chartValues} from './domain/estadisticas.js';

export function BarChart({title,entries,labelKey}){
  const values=entries.map(item=>Math.max(0,Number(item.cantidad)||0));
  const widths=chartValues(entries);
  return <section className="stats-chart" aria-label={title}>
    <h3>{title}</h3>
    {!entries.length?<p className="text-muted small">Todavía no hay datos para este grupo.</p>:
      <div role="list" aria-label={title}>
        {entries.map((entry,i)=><div role="listitem" className="stats-row" key={String(entry[labelKey]??i)}>
          <span className="stats-row-name">{String(entry[labelKey]??'Sin definir')}</span>
          <div className="stats-track" aria-hidden="true"><div className="stats-fill" style={{width:`${widths[i]}%`}}/></div>
          <strong className="text-end">{values[i]}</strong>
        </div>)}
      </div>}
  </section>;
}
