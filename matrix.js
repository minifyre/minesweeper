const matrix=(w=0,h=w,fill)=>({array:Array(h*w).fill(fill),height:h,width:w})
matrix.at=({array,width},x,y)=>array[width*y+x]
matrix.col=({array:a,height:h,width:w},x)=>Array(h).fill(1).map((_,i)=>a[i*w+x])
matrix.i2col=(m,i)=>matrix.col(m,matrix.i2x(m,i))
matrix.i2pt=(m,i)=>({x:matrix.i2x(m,i),y:matrix.i2y(m,i)})
matrix.i2row=(m,i)=>matrix.row(m,matrix.i2y(m,i))
matrix.i2x=({width},i)=>i%width
matrix.i2y=({width},i)=>Math.floor(i/width)
matrix.pt2i=({width},{x,y})=>x+y*width
matrix.row=({array:a,width:w},y)=>Array(w).fill(1).map((_,i)=>a[y*w+i])
export default matrix