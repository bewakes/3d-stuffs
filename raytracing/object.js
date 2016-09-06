var RealObject = function() {
};

var Vector3 = function(x,y,z) {
    if(y==undefined && z==undefined && x!=undefined) {
        this.x = x;this.y = y;this.z = z;
    }
    else {
        this.x = x||0; this.y = y||0; this.z = z||0;
    }
    this.mag = Math.sqrt(x*x+y*y+z*z);
    this.dot = function(l) { return l.x*this.x+l.y*this.y+l.z*this.z;};
    this.diff = function(l){ return new Vector3(this.x-l.x,this.y-l.y,this.z-l.z);};
    this.multiply = function(l) { return new Vector3(this.x*l.x, this.y*l.y, this.z*l.z);};
    this.add= function(l){ return new Vector3(this.x+l.x,this.y+l.y,this.z+l.z);};
    this.scale = function(k) { return new Vector3(this.x*k,this.y*k,this.z*k);};
    this.normalize = function() { return new Vector3(this.x/this.mag,this.y/this.mag,this.z/this.mag);};
    this.cross = function(l) {};
};

var Sphere = function(center, radius, surfacecolor, transparency, reflection, emissioncolor) {
    this.center = center;
    this.radius = radius;
    this.radius2 = radius*radius;
    this.surfaceColor = surfacecolor;
    this.transparency = transparency;
    this.reflection = reflection;
    this.emissionColor = emissioncolor||new Vector3(0,0,0);

    this.intersect = function(rayorig, raydir) {
        var origtocenter = this.center.diff(rayorig);
        var projo2c = origtocenter.dot(raydir);

        if(projo2c<0)return {intersect:false};
        var d2 = origtocenter.dot(origtocenter) - projo2c*projo2c;
        if (d2>this.radius2) return {intersect:false};
        var dst = Math.sqrt(this.radius2-d2);
        var d = projo2c - dst;
        var dd = d>0?d:projo2c+dst;
        var intersectpnt = rayorig.add(raydir.scale(dd));
        return {intersect:true, dist:dd, point:intersectpnt, normal:intersectpnt.diff(this.center).normalize()};
    };
}
