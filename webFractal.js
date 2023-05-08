//init canvas
var c = document.createElement("canvas");
c.id = "fractal";
c.height = window.innerHeight;
c.width = window.innerWidth;
document.body.appendChild(c);

//get img data
var ctx = c.getContext("2d");
var imgData = ctx.getImageData(0, 0, c.width, c.height);

// rectangle class
class Rectangle{
  constructor(centerX_, centerY_, width_, height_){
    this.width=width_;
    this.height=height_;
    this.left=centerX_-width_/2
    this.bottom=centerY_-height_/2;
    this.right=this.left+this.width;
    this.top=this.bottom+this.height;
  }
  //zoom given scale s, decimal percentages x, y
  zoom(s,x,y){
    this.left+=(x/c.width*this.width)*(1-s);
    this.bottom+=(y/c.height*this.height)*(1-s);
    this.width*=s,this.height*=s;
    this.right=this.left+this.width;
    this.top=this.bottom+this.height;
  }
  resize(w,h){
    this.left+=this.width/2-w/2;
    this.bottom+=this.height/2-h/2;
    this.width=w;
    this.height=h;
    this.right=this.left+this.width;
    this.top=this.bottom+this.height;
  }
}

//define fractal quantities
fRect=new Rectangle(-.5,0,2*c.width/c.height,2);
var escape=1000,maxItr=1024;

//compute 1 pixel
function computeFractal(x,y){
  var itr=0,zr=0,zi=0;
  var cr=fRect.left+fRect.width*x/c.width;
  var ci=fRect.bottom+fRect.height*y/c.height;
  while(zr*zr+zi*zi<escape*escape && itr < maxItr){
    let temp=zr*zr-zi*zi;
    zi=2*zr*zi+ci;
    zr=temp+cr;
    ++itr;
  }
  return itr;
}

//compute all pixels
function drawFractal(pixels){
  var x,y,i;
  for(y=0;y<c.height;y+=1){
    for(x=0;x<c.width;x+=1){
      i=(y*c.width+x)*4;
      var itr=computeFractal(x,y);
      itr=itr==maxItr?0:itr;
      //map iteration onto color gradient
      pixels.data[i]=itr>255?itr<512?511-itr:0:itr;
      pixels.data[i+1]=itr>511?itr<768?767-itr:0:itr>255?itr-256:0;
      pixels.data[i+2]=itr>767?itr<1024?1023-itr:0:itr>511?itr-512:0;
      pixels.data[i+3]=255;
    }
  }
}

//general zoom
function zoom(s,x,y){
  fRect.zoom(s,x,y);
}

//update canvas
var lastScroll=new Date();
var lastUpdate=new Date();
var numClicks=0;
var oldFrame=fRect;
function update(first=false){
  if(first || lastScroll>lastUpdate){
    let current=new Date();
    if(first || current-lastUpdate>500){
      drawFractal(imgData);
      ctx.putImageData(imgData, 0, 0);
      lastUpdate=new Date();
    }
    else{
      drawZoom(imgData, oldFrame);
    }
    oldFrame=fRect;
  }
}

//scroll zoom
var handleScroll = function(e){
  e.preventDefault();
  var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
  var rect = c.getBoundingClientRect();
  if (delta){
    zoom(Math.pow(1.1,delta),e.clientX-rect.left, e.clientY-rect.top);
    lastScroll=new Date();
  }
};
c.addEventListener('DOMMouseScroll',handleScroll,false);
c.addEventListener('mousewheel',handleScroll,false);

//detect clicks
document.getElementById("fractal").addEventListener("click",
  function(e){
    var rect = c.getBoundingClientRect();
    zoom(.5,e.clientX-rect.left, e.clientY-rect.top);
    lastScroll=new Date();
  });

//update on timer
setInterval(update, 1000);

//initial shading
drawFractal(imgData);
update(true);