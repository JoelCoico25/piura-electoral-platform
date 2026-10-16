"""Genera CSV normalizados para Piura y valida los totales del BI.
Uso: python database/import/build_import.py --catalog PATH --round1 PATH --round2 PATH
No requiere dependencias externas. No modifica archivos fuente.
"""
import argparse,csv,unicodedata,collections,pathlib
BASE=pathlib.Path(__file__).resolve().parents[1]
OUT=BASE/'processed'
EXPECTED={1:(932186,1396448),2:(1052088,1396448)}
def norm(x):
    return ' '.join(''.join(c for c in unicodedata.normalize('NFKD',x.upper().strip()) if not unicodedata.combining(c)).split())
def rows(path):
    with open(path,encoding='latin-1',newline='') as f:
        yield from csv.DictReader(f,delimiter=';')
def write(name,cols,items):
    with (OUT/name).open('w',encoding='utf-8',newline='') as f:
        w=csv.writer(f);w.writerow(cols);w.writerows(items)
def main():
    p=argparse.ArgumentParser();p.add_argument('--catalog',required=True);p.add_argument('--round1',required=True);p.add_argument('--round2',required=True);a=p.parse_args()
    catalog={}; provinces={}; districts={}
    for r in rows(a.catalog):
        if norm(r['NOMBDEP'])!='PIURA':continue
        ub=r['IDDIST'].zfill(6)
        key=(norm(r['NOMBPROV']),norm(r['NOMBDIST']))
        if key in catalog:raise ValueError(f'Distrito repetido en catálogo: {key}')
        catalog[key]=ub;provinces[ub[:4]]=r['NOMBPROV'].strip();districts[ub]=(ub[:4],r['NOMBDIST'].strip())
    assert len(provinces)==8 and len(districts)==65,(len(provinces),len(districts))
    election=[]
    for vuelta,path in [(1,a.round1),(2,a.round2)]:
        totals=collections.defaultdict(lambda:[0,0]);unmatched=set()
        for r in rows(path):
            if norm(r['DEPARTAMENTO'])!='PIURA' or norm(r['TIPO_ELECCION'])!='PRESIDENCIAL':continue
            key=(norm(r['PROVINCIA']),norm(r['DISTRITO']))
            # Variantes de nombre presentes en los archivos ONPE originales.
            aliases={('SECHURA','RINCONADA-LLICUAR'):('SECHURA','RINCONADA LLICUAR'),
                     ('TALARA','PARI¿¿AS'):('TALARA','PARINAS')}
            key=aliases.get(key,key)
            ub=catalog.get(key)
            if ub is None:unmatched.add(key);continue
            vals=totals[ub]
            vals[0]+=int(r['N_CVAS'] or 0)
            vals[1]+=int(r['N_ELEC_HABIL'] or 0)
        if unmatched:raise ValueError(f'No se pudo mapear {len(unmatched)} distritos: {sorted(unmatched)[:15]}')
        if len(totals)!=65:raise ValueError(f'Vuelta {vuelta}: solo {len(totals)} distritos')
        summary=tuple(sum(v[i] for v in totals.values()) for i in (0,1))
        if summary!=EXPECTED[vuelta]:raise ValueError(f'Vuelta {vuelta}: {summary} no coincide con BI {EXPECTED[vuelta]}')
        for ub,(votantes,habiles) in sorted(totals.items()):
            if votantes>habiles:raise ValueError(f'Votantes > habilitados en {ub}')
            election.append((ub,vuelta,habiles,votantes))
        print(f'Vuelta {vuelta}: 65 distritos, votantes={summary[0]:,}, habilitados={summary[1]:,} OK')
    OUT.mkdir(parents=True,exist_ok=True)
    write('departamentos.csv',['ubigeo','nombre'],[('20','PIURA')])
    write('provincias.csv',['ubigeo','departamento_ubigeo','nombre'],[(ub,'20',name) for ub,name in sorted(provinces.items())])
    write('distritos.csv',['ubigeo','provincia_ubigeo','nombre'],[(ub,*v) for ub,v in sorted(districts.items())])
    write('resultados_electorales.csv',['distrito_ubigeo','vuelta','electores_habiles','votantes'],election)
    print(f'Exportados CSV en {OUT}; 1 departamento, 8 provincias, 65 distritos, 130 resultados')
if __name__=='__main__':main()
