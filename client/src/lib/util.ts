export function parseDate(dateStr: string) {
  const re = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
  const match: any = dateStr.match(re);
  return Date.UTC(
    match[1],  // year
    match[2] - 1,  // monthIndex
    match[3],  // day
    match[4],  // hours
    match[5],  // minutes
    match[6]  //seconds
  );
}