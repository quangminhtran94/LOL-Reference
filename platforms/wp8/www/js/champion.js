$(document).on('pageinit', "#champion-detail",function () {
	var parameters = $(this).data("url").split("?")[1];
	id = parameters.replace("id=","");  
	$.ajax({url: BASE_URL + STATIC_DATA_CATEGORY + NA_REGION + VERSION + CHAMPION_CATEGORY + "/"+id+"?champData=image,stats,info,spells,passive&"+API_KEY, success: function(result){
		$('#champion-name').text(result.name);
		$('#champion-title').text(result.title);
		$.each(result.info, function(key, value){
			var selector='#'+key+" div";

			$(selector).css("width", (value*8).toString()+"%" );
		})

		$.each(result.stats, function(key, value){
			var selector='#'+key;
			$(selector).empty();
			$(selector).append(value);
		});

		var atkspd = (0.625/(1+result.stats.attackspeedoffset)).toFixed(2);
		$('#attackspeed').empty();
		$('#attackspeed').append(atkspd);

		$('#champion-image').empty();
		$('#champion-image').append("<img src='"+ BASE_CHAMPION_IMAGE_URL+result.image.full+"'>");

		$('#champion-spells').empty();
		$('#champion-spells').append('<li><img src="' + BASE_PASSIVE_IMAGE_URL +result.passive.image.full+'"><p>' +'<b>' + result.passive.name + ' (Passive)</b><br>' +  result.passive.description +'</p></li>').listview("refresh");
		var skillKeyboard = ['(Q)','(W)','(E)','(R)'];
		$.each(result.spells, function(index, value){
			var cost = '<i>Cost: ' + SpellToString(value, value.resource) + '</i><br>';
			$('#champion-spells').append('<li><img src="' + BASE_SPELL_IMAGE_URL +value.image.full+'"><p>' + '<b>' + value.name + ' ' +skillKeyboard[index]+ '</b><br>' + cost + SpellToString(value, value.tooltip) +'</p></li>').listview("refresh");
		});
		$('#champion-spells li p').css("white-space","normal");
	}});
});   


function SpellToString(spell, str){
	var start=0;
	str = str.replace(/{{ cost }}/g, spell.costBurn);
	while(str.indexOf('{{', start) != -1){
		var index = str.indexOf('{{', start);
		switch(str[index+3]){
			case 'e':
			case 'f':
			var num = parseInt(str[index+4]);
			str = str.replace('{{ '+str[index+3]+str[index+4],spell.effectBurn[num]);
			str = str.replace(' }}','');
			break;
			case 'a':
			var key = str.substring(index+3, index+5);
			for(i=0; i<spell.vars.length;i++){
				if(spell.vars[i].key == key){
					var replace = spell.vars[i].coeff[0];
					switch(spell.vars[i].link){
						case "attackdamage":
						replace += ' AD';
						break;
						case "spelldamage":
						replace += ' AP';
						break;
						case "bonusattackdamage":
						replace += ' bonus AD';
						break;
						case "bonusspelldamage":
						replace += ' bonus AP';
						break;
						default:
						break;
					}
					str = str.replace('{{ a'+str[index+4],replace);
					str = str.replace(' }}','');
					break;
				}
			}
			break;
			default:
			break;
		}
		start = index;

	}
	return str;
}