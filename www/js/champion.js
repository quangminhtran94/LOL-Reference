$(document).on('pageinit', "#champion-detail",function () {
	var parameters = $(this).data("url").split("?")[1];
	id = parameters.replace("id=","");
	changeLang(language);
	$.ajax({url: BASE_URL + STATIC_DATA_CATEGORY + NA_REGION + VERSION + CHAMPION_CATEGORY + "/"+id+"?"+LOCATION+"="+language+ "&champData=image,stats,info,spells,passive&"+API_KEY, success: function(result){
		$('#champion-name').text(result.name);
		$('#champion-title').text(result.title);
		$.each(result.info, function(key, value){
			var selector='#'+key+" div";
			$(selector).css("width", (value*8).toString()+"%" );
		})
		$.each(result.stats, function(key, value){
			var selector = '#'+key;
			if($(selector).length){
				$(selector).empty();
				$(selector).append(value);
			}
			
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
	$('#champion-recommend').bind('collapsibleexpand', function(event, ui){
		$('#recommended-items').empty();
		$.ajax({url: BASE_URL + STATIC_DATA_CATEGORY + NA_REGION + VERSION + CHAMPION_CATEGORY + "/"+id+"?"+LOCATION+"="+language+ "&champData=recommended&"+API_KEY, success: function(result){
			$.each(result.recommended, function(index, value){
				if(value.map =="SR" && value.mode == "CLASSIC"){
					$.each(value.blocks, function(index, value){
						var type = value.type;
						$("#recommended-items").append("<li id='"+value.type+"'><p><b id='"+value.type+"-title'></b></p></li>");
						changeLang(language);
						$.each(value.items, function(index, value){
							var numberOfItem = value.count;
							$.ajax({url: BASE_URL + STATIC_DATA_CATEGORY + NA_REGION + VERSION + ITEM_CATEGORY + "/"+value.id+"?"+LOCATION+"="+language+ "&itemData=image&"+API_KEY , success: function(result){
								for(i = 0; i < numberOfItem; i++){
									$("#"+type).append('<img src="' + BASE_ITEM_IMAGE_URL + result.image.full +'">');
								}	
							}});
						});
					});
				}
			});
		}});
	});
});  


function SpellToString(spell, str){
	var start=0;
	str = str.replace(/{{ cost }}/g, spell.costBurn);
	if(spell.name=="Arise!" && str[0]=="A"){
		str = "Azir summons an untargetable Sand Soldier for 9 seconds. When Azir attacks an enemy in a soldier's range, the soldier attacks instead of Azir - dealing 50 / 55 / 60 / 65 / 70 / 75 / 80 / 85 / 90 / 95 / 100 / 110 / 120 / 130 / 140 / 150 / 160 / 170 (45 + 5 / 10 at each level) (+ 60% AP) magic damage to all enemies in a line. If multiple soldiers strike the same target, each soldier after the first deals 25% damage.<br> Azir can store up to 2 Sand Soldiers at a time, but there is no hard limit on the number of Sand Soldiers that can be active on the field at once. Sand Soldiers expire twice as fast while within range of an enemy turret, and will expire instantly if Azir moves too far away.<br>	Sand Soldiers cannot attack enemy structures, but can be summoned directly on top of an enemy turret to sacrifice it and deal 60 / 70 / 80 / 90 / 100 / 110 / 120 / 130 / 140 / 150 / 160 / 170 / 180 / 190 / 200 / 210 / 220 / 230 (50 + 10 × Azir's level) (+ 40% AP) magic damage to the turret.";
	}else{
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
	}
	
	return str;
}