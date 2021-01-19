window.addEventListener('load', ()=>{
	canvas.addEventListener("mousedown",startPainting);
	canvas.addEventListener("mouseup",stopPainting);
	canvas.addEventListener("mousemove",sketch);
	canvas.addEventListener("mousemove",sketch);
});

function getPosition(event){
	coord.x = event.clientX - canvas.offsetLeft;
	coord.y = event.clientY - canvas.offsetTop;
}

function startPainting(event){
	paint = true;
	getPosition(event);
}

function stopPainting(){
	paint = false;
}

function sketch(event){
	if(!paint) return;
	ctx.beginPath()
	ctx.lineWidth = 5;

	ctx.lineCap = 'round';
	ctx.strokeStyle = 'green';

	ctx.moveTo(coord.x, coord.y);
	getPosition(event);
	ctx.lineTo(coord.x, coord.y);

	ctx.stroke();
}
