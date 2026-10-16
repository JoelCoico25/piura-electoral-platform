"""Extracts district poverty (INEI 2018) and HDI/income (PNUD 2019).
Requires artifact_tool for XLSX reading; the distributed CSVs are ready to load
without Python dependencies. Source workbooks remain untouched.
"""
import argparse, csv, pathlib
from artifact_tool import Blob, SpreadsheetFile
BASE = pathlib.Path(__file__).resolve().parents[1]
OUT = BASE / 'processed'

def sheet(path, name):
    book = SpreadsheetFile.import_xlsx(Blob.load(str(path)))
    return next(s for s in book.worksheets.items if s.name == name)

def ubigeo(value):
    return str(value).strip().zfill(6)

def write(filename, header, rows):
    with (OUT / filename).open('w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--poverty', required=True, type=pathlib.Path)
    p.add_argument('--development', required=True, type=pathlib.Path)
    args = p.parse_args()
    districts = set()
    with (OUT / 'distritos.csv').open(encoding='utf-8', newline='') as f:
        districts = {r['ubigeo'] for r in csv.DictReader(f)}
    assert len(districts) == 65
    poverty = {}
    for r in sheet(args.poverty, 'A3.22').get_range('A8:I160').values:
        code = ubigeo(r[0]) if r[0] is not None else ''
        if code not in districts: continue
        if code in poverty: raise ValueError(f'Duplicate poverty: {code}')
        low, high = r[5], r[6]
        if not (isinstance(low, (float,int)) and isinstance(high,(float,int)) and 0 <= low <= high <= 100):
            raise ValueError(f'Invalid poverty interval for {code}: {low}, {high}')
        poverty[code] = (code, 2018, round(low, 8), round(high, 8))
    development = {}
    for r in sheet(args.development, 'Distrital').get_range('A8:P2300').values:
        code = ubigeo(r[0]) if r[0] is not None else ''
        if code not in districts: continue
        if code in development: raise ValueError(f'Duplicate development: {code}')
        idh, income = r[7], r[15]
        if not (isinstance(idh,(float,int)) and 0 <= idh <= 1 and isinstance(income,(float,int)) and income >= 0):
            raise ValueError(f'Invalid development values for {code}: {idh}, {income}')
        development[code] = (code, 2019, round(idh, 9), round(income, 6))
    for label, data in [('poverty',poverty),('development',development)]:
        missing = districts - data.keys()
        if missing: raise ValueError(f'{label}: missing {len(missing)} districts: {sorted(missing)}')
    write('indicadores_pobreza.csv', ['distrito_ubigeo','anio','pobreza_inferior_pct','pobreza_superior_pct'], [poverty[k] for k in sorted(poverty)])
    write('indicadores_desarrollo.csv', ['distrito_ubigeo','anio','idh','ingreso_familiar_per_capita_mensual'], [development[k] for k in sorted(development)])
    print('OK: 65 poverty records (2018) and 65 development records (2019).')

if __name__ == '__main__': main()
