//armazena dois vetores com as coordenadas de inicio e fim da linha 
class Line{
	constructor(p_ini, p_end, path, color){
		this.ini = p_ini;
		this.end = p_end;
		this.path = path;
		this.color = color;
	}

	create_path(){
		this.path = new Path2D();
		this.path.moveTo(this.ini.x, this.ini.y);
		this.path.lineTo(this.end.x, this.end.y);
	}

}

//armazena uma coordenada em um plano 2d
class Coord{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}

//inicializando canvas do JS
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//configurando aparencia das reta
ctx.lineWidth = 10;
ctx.lineCap = 'round';
ctx.strokeStyle = 'green';

//instanciando objetos do tipo linha
var lines = [];


var splitted_lines = [];
var making_edge = 0;

//inicializa coordenadas do mouse
var mouse_coord = new Coord(0,0);
var mouse_start = new Coord(0,0);

var selected = 0;
var selected_line = 0;
var pressed_button = -1;

//adicionando evento ao clicar na tela
window.addEventListener('load', ()=>{
	canvas.addEventListener("mousedown", select);
	canvas.addEventListener("mouseup", unselect);
	canvas.addEventListener("mousemove", move_line);
	canvas.addEventListener("contextmenu", split_line);
});

//atualiza posicao do ponteiro do mouse
function getPosition(event){
	var rect = canvas.getBoundingClientRect();

	mouse_coord.x = event.clientX - rect.left;
	mouse_coord.y = event.clientY - rect.top;

}

function draw_polygon(numberOfSides){
	ctx.colorStroke = 'green'
	lines = [];

	var radius=100;
	var x = 400;
	var y = 200;
	var angle = 2*Math.PI/numberOfSides;

	for (var i = 1; i <= numberOfSides; i ++) {

		lines.push( new Line( new Coord( x + radius* Math.cos( (i-1) * angle),  y + radius*Math.sin( (i-1)*angle) ), new Coord( x + radius* Math.cos( (i) * angle),  y + radius*Math.sin( (i)*angle) ), 0, 'green') );

	}

	var line;
	for(line of lines){
		line.create_path();
	}

	draw();

}

//verifica se um elemento foi selecionado pelo clique
function select(event){
	getPosition(event);
	for (line of lines){
		if(ctx.isPointInStroke(line.path, mouse_coord.x, mouse_coord.y)){

			selected = 1;
			selected_line = line;
			pressed_button = event.button;

		}
	}
	
}

function split_line(event){
	event.preventDefault();	//faz o menu de opcoes sumir
	getPosition(event);
	var line_to_split = 0;

	for (line of lines){
		if(ctx.isPointInStroke(line.path, mouse_coord.x, mouse_coord.y)){
			line_to_split = line;
		}
	}

	if(line_to_split != 0){	
		var ini = new Coord(line_to_split.end.x, line_to_split.end.y);
		var end = new Coord(mouse_coord.x, mouse_coord.y);

		var new_line = new Line(ini, end, 0, 0);
		new_line.color = '#ff0000';
		new_line.create_path();

		lines.push(new_line);

		//alterando linha para ser ponto inicio - ponto clique
		line_to_split.end.x = mouse_coord.x;
		line_to_split.end.y = mouse_coord.y;
		line_to_split.color = '#f7ff00';
		line_to_split.create_path();
		draw();

		splitted_lines = [];
		splitted_lines.push(line_to_split);
		splitted_lines.push(new_line);

		
		making_edge = 1;
	}
}

function draw(){
	ctx.clearRect(0,0,canvas.width, canvas.height);

	for (line of lines){
		ctx.beginPath(); //resseta o caminho salvo em ctx
		ctx.strokeStyle = line.color;
		ctx.stroke(line.path);
	}

}

function unselect(event){
	//detecta qual botao foi solto
	switch (event.button){
		//botão da esquerda
		case 0:
			selected = 0;
			selected_line.color = '#008000'; //retorna com a cor verde
			break;

		case 2:
			making_edge = 0;
			splitted_lines[0].color = '#008000';
			splitted_lines[1].color = '#008000';
			break;
	}

	ctx.colorStroke = '#008000';
	// alert("No unselect");
}

//calcula a distancia entre o ponto a e b
function distance(a, b){
	dist = Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2);
	dist = Math.sqrt(dist);

	return dist;
}


function move_line(event){
	if(selected){
		getPosition(event);

		//botao esquerdo pressionado
		if(pressed_button == 0){
			selected_line.color = '#0000FF';

			// distancia ponto inicial ao ponto do clique
			var dist_a = distance(selected_line.ini, mouse_coord); 

			//distancia ponto inicial ao ponto do clique
			var dist_b = distance(selected_line.end, mouse_coord);

			var m_point = new Coord( (selected_line.ini.x + selected_line.end.x)/2, (selected_line.ini.y + selected_line.end.y)/2 )

			//distancia ponto inicial ao ponto do clique
			var dist_m = distance(m_point, mouse_coord);


			//clique proximo ao inicio da reta 
			if(dist_a < dist_b & dist_a < dist_m){
				selected_line.ini.x = mouse_coord.x;
				selected_line.ini.y = mouse_coord.y;

				selected_line.create_path();				
				draw();
			}

			// clique proximo ao fim da reta - altera ponto da reta
			else if(dist_b < dist_a & dist_b < dist_m){
				selected_line.end.x = mouse_coord.x;
				selected_line.end.y = mouse_coord.y;

				selected_line.create_path();				
				draw();
			}

			// clique no meio da reta - arrasta linha inteira
			else if(dist_m < dist_a & dist_m < dist_b){

				
				//salva "distancia" ponto medio com relacao aos outros pontos
				var x_dist_ini = m_point.x - selected_line.ini.x;
				var y_dist_ini = m_point.y - selected_line.ini.y;


				var x_dist_end = selected_line.end.x - m_point.x;
				var y_dist_end = selected_line.end.y - m_point.y;

				//atualiza ponto medio da reta
				m_point.x = mouse_coord.x;
				m_point.y = mouse_coord.y;

				//atualiza posicao inicial do mouse
				mouse_start.x = mouse_coord.x;
				mouse_start.y = mouse_coord.y;

				//atualiza posição da reta
				selected_line.ini.x = m_point.x - x_dist_ini;
				selected_line.ini.y = m_point.y - y_dist_ini;

				selected_line.end.x = m_point.x + x_dist_end;
				selected_line.end.y = m_point.y + y_dist_end;

				selected_line.create_path();				
				draw();

			}

		}

		//botao direito pressionado
		else if(pressed_button == 2){

			if(making_edge){
				for(line of splitted_lines){
					line.end.x = mouse_coord.x;
					line.end.y = mouse_coord.y;
					line.create_path();
				}

				draw();

			}
			
		}

	}

}