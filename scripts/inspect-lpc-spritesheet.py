from PIL import Image, ImageDraw
from pathlib import Path
import json

path = Path("commit-cave/assets/hero-sheet.png")
im = Image.open(path).convert("RGBA")
W,H = im.size
FRAME = 64
cols, rows = W // FRAME, H // FRAME
assert W % FRAME == 0 and H % FRAME == 0, f"Sheet {W}x{H} not aligned to 64px"

def frame_stats(row, col):
    crop = im.crop((col*FRAME, row*FRAME, (col+1)*FRAME, (row+1)*FRAME))
    alpha = crop.getchannel("A")
    hist = alpha.histogram()
    opaque = sum(hist[129:])
    bbox = alpha.point(lambda p: 255 if p > 128 else 0).getbbox()
    return {"opaque": opaque, "bbox": list(bbox) if bbox else None}

row_data=[]
for row in range(rows):
    cells=[frame_stats(row,col) for col in range(cols)]
    valid=[c for c in cells if c["opaque"] >= 150]
    row_data.append({
        "row": row,
        "valid_columns":[i for i,c in enumerate(cells) if c["opaque"] >= 150],
        "counts":[c["opaque"] for c in cells],
        "first_frame":cells[0],
        "max_opaque":max(c["opaque"] for c in cells),
        "valid_frames":len(valid)
    })

# Contact sheet: each row's first frame and a representative most-opaque frame,
# enlarged with nearest-neighbor pixels and labelled with row/column.
cell_w, cell_h = 64, 84
preview=Image.new("RGBA",(cols*cell_w,rows*cell_h),(10,14,28,255))
draw=ImageDraw.Draw(preview)
for r,info in enumerate(row_data):
    best_col=max(range(cols),key=lambda c:info["counts"][c])
    for slot,col in enumerate((0,best_col)):
        frame=im.crop((col*FRAME,r*FRAME,(col+1)*FRAME,(r+1)*FRAME))
        frame=frame.resize((64,64),Image.Resampling.NEAREST)
        preview.alpha_composite(frame,(slot*cell_w,r*cell_h))
        draw.text((slot*cell_w+2,r*cell_h+65),f"r{r:02} c{col:02} {info['counts'][col]}",fill=(235,240,255,255))
# left half is frame zero in each row; right half shows row's most visible frame.
preview.save("lpc-contact-sheet.png")
report={"file":str(path),"dimensions":[W,H],"frame_size":[64,64],"columns":cols,"rows":rows,"minimum_opaque":150,"row_analysis":row_data}
Path("lpc-audit.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
print(f"LPC_AUDIT_DIMENSIONS {W}x{H} GRID {cols}x{rows}")
for item in row_data:
    if item["max_opaque"] >= 150:
        print("LPC_ROW "+json.dumps({
            "row":item["row"],
            "valid_columns":item["valid_columns"],
            "first_frame_opaque":item["first_frame"]["opaque"],
            "first_frame_bbox":item["first_frame"]["bbox"],
            "max_opaque":item["max_opaque"],
            "max_frame_col":item["counts"].index(item["max_opaque"]),
            "all_counts":item["counts"]
        },separators=(",",":")))
