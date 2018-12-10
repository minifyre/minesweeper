output.render=function({file,view})
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