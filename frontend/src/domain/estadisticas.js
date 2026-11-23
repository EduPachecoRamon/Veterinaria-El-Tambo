export function chartValues(entries){
  const numbers=entries.map(item=>Math.max(0,Number(item.cantidad)||0));
  const max=Math.max(1,...numbers);
  return numbers.map(value=>value/max*100);
}
