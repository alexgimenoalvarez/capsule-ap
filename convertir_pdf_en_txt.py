"""Capsule AP V4 - Convertit localement les PDF en fichiers TXT indexables.
Utilisation : python convertir_pdf_en_txt.py "CHEMIN_DU_DOSSIER_PDF"
Les PDF ne quittent pas l'ordinateur. Nécessite : pip install pymupdf
"""
import sys
from pathlib import Path
try:
    import fitz
except ImportError:
    raise SystemExit('Module manquant. Lance : python -m pip install pymupdf')

def run(folder: Path) -> None:
    if not folder.exists():
        raise SystemExit(f'Dossier introuvable : {folder}')
    dest = folder / 'Capsule_AP_index_txt'
    dest.mkdir(exist_ok=True)
    files = sorted(folder.rglob('*.pdf'))
    files = [p for p in files if dest not in p.parents]
    if not files:
        raise SystemExit('Aucun PDF trouvé dans ce dossier.')
    ok = 0
    for p in files:
        try:
            doc = fitz.open(p)
            content = []
            for i, page in enumerate(doc):
                txt = page.get_text(sort=True).strip()
                content.append(f'\n\n=== PAGE {i+1} ===\n{txt}\n')
            relative = p.relative_to(folder)
            target = dest / relative.with_suffix('.txt')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(''.join(content), encoding='utf-8')
            ok += 1
            print(f'OK : {relative} ({len(doc)} pages)')
        except Exception as exc:
            print(f'ERREUR : {p.name} : {exc}')
    print(f'\n{ok}/{len(files)} index TXT disponibles dans : {dest}')
    print('Importe les fichiers .txt dans l\'onglet Documents de Capsule AP.')

if __name__ == '__main__':
    if len(sys.argv)<2:
        raise SystemExit('Utilisation : python convertir_pdf_en_txt.py "DOSSIER_CONTENANT_PDF"')
    run(Path(sys.argv[1]).expanduser().resolve())
