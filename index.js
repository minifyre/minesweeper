import matrix from './matrix.js'
import truth from '../node_modules/truth/truth.mjs'
import v from '../node_modules/v/v.mjs'

const config={}
config.icons=
{
	'??':'?',
	'flag':'O',
	'mine':'*',
	'misplaced':'x'
}

const
input={},
logic=function(cols,rows=cols,mines=cols)
{
	const state=
	{
		file:
		{
			board:matrix(rows,cols,''),//underlying real content (mine locations)
			cols,
			mines,
			move:-1,
			overlay:matrix(rows,cols,'hidden'),//@todo move shown content into view
			remaining:mines,
			unrevealed:cols*rows,
			rows,
			status:'started'//win,lose
		},
		view:
		{
		}
	}

	//place mines
	const indexes=Array(cols*rows).fill(1).map((_,i)=>i)
	Array(state.file.mines).fill(1)
	.map(()=>indexes.splice(logic.rand(indexes.length),1)[0])
	.forEach(i=>state.file.board.array[i]='mine')

	//setup adjacent mine counts
	state.file.board.array=state.file.board.array
	.map(function(val,i)
	{
		const pt=matrix.i2pt(state.file.board,i)

		return val==='mine'?val:
		logic.matrixAdjacentPts({height:rows,width:cols},pt)
		.map(pt=>matrix.pt2i(state.file.board,pt))
		.map(i=>(state.file.board.array[i]==='mine')|0)
		.reduce((sum,num)=>sum+num,0)
	})

	return state
}

input.block=evt=>evt.preventDefault()
input.tile=function(state,evt)
{
	const
	{file}=state,
	target=evt.target,
	i=parseInt(target.id),
	{x,y}=matrix.i2pt(state.file.board,i)

	if(state.file.status!=='started') return

	if(target.nodeName.toLowerCase()!=='span') return 

	if(evt.which===3) logic.toggleTile(state,x,y)

	if(evt.which===1&&file.overlay.array[i]!=='flag')
	{
		if(file.board.array[i]==='mine')
		{
			logic.finish(state,'lose')
			file.overlay.array[i]='bomb'
		}
		else if(file.overlay.array[i]==='hidden') logic.reveal(state,x,y)
	}

	if(file.unrevealed===file.mines) logic.finish(state,'win')
	//@todo turn all remaining hidden tiles to flags

	file.move+=1//@todo do not trigger if an empty tile is clicked
}

logic.finish=function(state,status='lose')
{
	const win=status==='win'
	state.file.overlay.array=state.file.overlay.array.map(function(val,i)
	{//@todo spinoff into reveal all & reuse for win state
		return	state.file.board.array[i]==='mine'?(win?'flag':'mine'):
				val==='flag'?'misplaced':
				val
	})
	state.file.status=status
}

logic.rand=num=>Math.floor(Math.random()*num)
logic.inRange=(min,max,val)=>val<=max&&val>=min
logic.matrixAdjacentPts=function({height,width},{x,y},diagonal=true,wrapAround=false)
{
	const arr=Array(9).fill(1)
	.map((_,i)=>[i%3-1,Math.floor(i/3)-1])
	.filter(([h,v])=>h||v)//remove 0,0
	.filter(([h,v])=>diagonal||Math.abs(h+v)===1)
	.map(([h,v])=>[x+h,y+v])

	return (wrapAround?arr.map(function([x,y])
	{
		x=	x<0?width-1:
			x===width?0:
			x
		y=	y<0?height-1:
			y===height?0:
			y

		return [x,y]
	}):arr.filter(([x,y])=>(x>-1&&x<width)&&(y>-1&&y<height)))
	.map(([x,y])=>({x,y}))
}
logic.reveal=function(state,x,y)
{
	const
	{cols,board,overlay,rows}=state.file,
	i=matrix.pt2i(board,{x,y})

	if(board.array[i]!=='mine'&&overlay.array[i]==='hidden') state.file.unrevealed-=1
	overlay.array[i]=board.array[i]

	if(board.array[i]!==0) return

	logic.matrixAdjacentPts({height:rows,width:cols},{x,y})
	.filter(pt=>overlay.array[matrix.pt2i(board,pt)]==='hidden')
	.forEach(({x,y})=>logic.reveal(state,x,y))
}
logic.shuffle=function(state)
{
	const {cols,rows,mines}=state.file
	Object.assign(state,logic(cols,rows,mines))
	state.file.move+=1
}
logic.toggleTile=function({file},x,y)
{
	const [_,[newVal,inc]]=Object.entries(
	{
		hidden:['flag',-1],
		flag:['??',1],
		'??':['hidden',0]
	})
	.find(([key])=>key===matrix.at(file.overlay,x,y))

	file.remaining+=inc
	file.overlay.array[matrix.pt2i(file.overlay,{x,y})]=newVal
}

function output({file,view})
{	
	const
	msgs=//@todo move base text into config
	{
		lose:':(',
		started:':| '+file.remaining+'/'+file.mines,
		win:':)'
	},
	h=file.rows*30,
	w=file.cols*30,
	style=`height:${h}px; width:${w}px;`,
	on=
	{
		contextmenu:input.block,
		pointerup:evt=>input.tile(state,evt)
	}

	return [
		v('header',{on:{pointerup:()=>logic.shuffle(state)}},msgs[file.status]),
		v('main',{on,style},
			...file.overlay.array.map(function(type,id)
			{
				const
				opts={data:{type},id},
				classes=[],
				txt=type!=='hidden'&&!!type?(type==='bomb'?'mine':type):''

				if((''+type).length>1) classes.push(type!=='bomb'?'hidden':'bomb')
				if(txt==='mine') classes.push(txt)

				if(classes.length) opts.class=classes.join(' ')

				return v('span',opts,config.icons[txt]||txt)
			},[])
		)
	]
}

const
{state}=truth
(
	logic(9,9,5),
	truth.compile(function({state})
	{
		return v.render(document.body,state,output,function({path})
		{
			return path.join('/')==='file/move'
		})
	})
)

onload=()=>logic.shuffle(state)