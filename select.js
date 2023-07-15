import { Vertex, Hedge, Face } from './half-edge.js';

var vis = {};

halfs = [];

halfs.forEach(he => {
    let a   = he.vOrig.id;
    let b   = he.next.vOrig.id;
    key     = sort([a, b]).tostring();
    if (!key in vis) {
        vis[key] = he;
    }
    else {
        he.etwin        = vis[key];
        vis[key].etwin  = he
        delete vis[key];
    }
});

/*
in:
    pnt = []
    ind = []

out:
    verts = []
    halfs = []
    faces = []
*/

for (let i = 0; i < pnt.length; i++) {
    let element   = pnt[i];
    let v           = new Vertex();
    v.p             = element;
    verts.append(v);
    v.id = i;
}
for (let i = 0; i < ind.length; i++) {
    let element = ind[i];
    let h0 = new Hedge();
    let h1 = new Hedge();
    let h2 = new Hedge();
    let f = new Face();
    
    ids = element;
    h0.vOrig = verts[ids[0]];
    h1.vOrig = verts[ids[1]];
    h2.vOrig = verts[ids[2]];

    h0.next = h1;
    h1.next = h2;
    h2.next = h0;

    h0.face = f;
    h1.face = f;
    h2.face = f;

    f.hedge = h0;

    verts[ids[0]].hedge = h0;
    verts[ids[1]].hedge = h1;
    verts[ids[2]].hedge = h2;

    halfs.append(h0);
    halfs.append(h1);
    halfs.append(h2);

    faces.append(f);
}

halfs.forEach(he => {
    let v = he.vOrig;

    if (v.hedge != null) {
        v.hedge = he;
    }
});

var s = [];

he = verts[vid].hedge;
h0 = he;
s.append(h0.face);

while (he.next.next != null && he.next.next != h0) {
    he = he.next.next.etwin;
    s.append(he.face);
}