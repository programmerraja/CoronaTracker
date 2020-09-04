var district_name_array=[];
function getAllData(argument)
 	{
 			let Districtlink="https://api.covid19india.org/state_district_wise.json"
 			//getting district data 
			$.getJSON(Districtlink,function(data)
			{
				//getting state name clicked by user
				let state_name=sessionStorage.getItem("state")
				if(state_name)
				{
					//getting the statecode  names 
					let state_code=data[state_name]["statecode"];
					//getting the district names 
					let districts=Object.keys(data[state_name]["districtData"]);
					//getting user clicked state data for status 
					let state_data=JSON.parse(sessionStorage.getItem("state_data"));
					//storing the retrived data to var 
					let tactive=state_data["tactive"];
					let tconfirmed=state_data["tconfirmed"];
					let trecovered =state_data["trecovered"];
					let tdeaths=state_data["tdeaths"];

					let diff_confirm=state_data["diff_confirm"];
					let diff_recovered=state_data["diff_recovered"];
					let diff_deaths=state_data["diff_deaths"];

					//call func to add to it status by passing args 1 at last
					addDataToTable([tactive,tconfirmed,trecovered,tdeaths],[diff_confirm,diff_recovered,diff_deaths],1)
					
					//iterating only district  object
					for(let i=3;i<districts.length;i++)
					{
						let district=districts[i];
						let active=data[state_name]["districtData"][districts[i]]["active"]
						let confirmed=data[state_name]["districtData"][districts[i]]["confirmed"]
						let recovered=data[state_name]["districtData"][districts[i]]["recovered"]
						let deaths=data[state_name]["districtData"][districts[i]]["deceased"]
						//call func to add data to table 
						getPrevDayData(state_code,[active,confirmed,recovered,deaths,district])
					}
					//append state name 
					$("#state-name").text(state_name);
				}
				else
				{
					window.location.replace("https://programmerraja.github.io/coronatracker/index");
				}
			})
 	}
//geting prev data to calc the difference 
function getPrevDayData(state_code,data_array,hascache) 
{
		//getting prev date for state 
		let prevdate=sessionStorage.getItem("prevdate")
	    prevdate=prevdate.split("-");
		//creating date object and month start from zero so minus one 
		prevdate=new Date(prevdate[0],prevdate[1]-1,prevdate[2]);
		//calculating prev day by sub one
		prevdate.setDate(prevdate.getDate()-1);
		// it return day/month/year, hr:min:sec AM
		prevdate=prevdate.toLocaleString();
		//spilting date and time 
		prevdate=prevdate.split(",")[0];
		// convert day/month/year day month year
		prevdate=prevdate.split("/");
		//if day is single digit adding zero to it 
		if(prevdate[0].length==1)
		{
			prevdate[0]="0"+prevdate[0]
		}
		//if date is single digit adding zero to it 
		if(prevdate[1].length==1)
		{
			prevdate[1]="0"+prevdate[1]

		}
		//changing date format to year/day/date
		prevdate=prevdate[2]+"-"+prevdate[0]+"-"+prevdate[1];
		let link="https://api.covid19india.org/v3/data-"+prevdate+".json";
		fetch(link).then((response) => {
    					return response.json()
  						}).then((data)=>{
  									//call the func to exctract the prev data from whole data 
  									extractPrevData(data,data_array,state_code)
  								}
  							).catch(()=>{});
}

function extractPrevData(data,data_array,state_code)
{
	//store prev day data in array 
	let prev_data_array=[]
	let district=data_array[data_array.length-1]
	if(data[state_code]!==undefined)
	{
		//if not defined push zero to array
	    if(data[state_code]["districts"][district]["total"]["confirmed"]===undefined)
		{			    
	     	prev_data_array.push(0)
		}
		else
		{
			prev_data_array.push(data[state_code]["districts"][district]["total"]["confirmed"])
		}
	    if(data[state_code]["districts"][district]["total"]["recovered"]===undefined)
	    {
		    prev_data_array.push(0)
		}
		else
		{
			prev_data_array.push(data[state_code]["districts"][district]["total"]["recovered"])
		}			    
	    //if none one died pushing zero 
		if(data[state_code]["districts"][district]["total"]["deceased"]===undefined)
	    {
		    prev_data_array.push(0)
		}
		else
		{
				prev_data_array.push(data[state_code]["districts"][district]["total"]["deceased"])
		}
		//call func to add data to tabel 
		addDataToTable(data_array,prev_data_array,0);
	}
}
function addDataToTable(data_array,prev_data_array,isstatus)
{
			//retrive the valu from array 
			let active=data_array[0];
			let confirmed=data_array[1];
			let recovered=data_array[2];
			let deaths=data_array[3];

			//get prev date 
			let date=sessionStorage.getItem("prevdate");

			//  img src 
			let up_img_src="image/upimg.png";
			let down_img_src="image/downimg.png";
			let upgreen_img_src="image/upgreenimg.png"

			//img 
			let increases="<br><img src="+up_img_src+" height='12px' width='12px'><span style='font-size:.7rem;'>"
			let decreases="<br><img src="+down_img_src+" height='12px' width='12px'><span style='font-size:.7rem;'>"
			
			//checking if it add to satus or table 
			if(isstatus==1)
			{
				var diff_confirm=prev_data_array[0]
				var diff_recovered=prev_data_array[1]
				var diff_deaths=prev_data_array[2]
				
				//checking for diff and adding corresponding image for it 
			    if(diff_confirm>0)
			    {
			    	$("#confirmed-no").append(confirmed+increases+diff_confirm+"</span>");
			    }
			    //check if is negative to avoid adding img for zero 
			    else if (diff_confirm<0)
			    {
			    	$("#confirmed-no").append(confirmed+decreases+Math.abs(diff_confirm)+"</span>");
			    }
			    if(diff_deaths>0)
			    {
			    	$("#deaths-no").append(deaths+increases+diff_deaths+"</span>");
			    }
			    else if(diff_deaths<0)
			    {
			    	$("#deaths-no").append(deaths+decreases+Math.abs(diff_deaths)+"</span>");
			    }
			    if(diff_recovered>0)
			    {
			    	//setting uparrow img for recovered 
			    	let increases="<br><img src="+upgreen_img_src+" height='12px' width='12px'><span style='font-size:.7rem;'>"
			    	$("#recovered-no").append(recovered+increases+diff_recovered+"</span>");
			    }
			    else if (diff_recovered<0)
			    {
			    	$("#recovered-no").append(recovered+decreases+Math.abs(diff_recovered)+"</span>");
			    }
			    $("#active-no").append(active);
				$("#status-date").text(date);
			}
			else
			{	
				let prev_confirm=prev_data_array[0]
				let prev_recoverd=prev_data_array[1]
				let prev_deaths=prev_data_array[2]

				//calculating the difference 
				let diff_confirm=(confirmed-prev_confirm);
				let diff_deaths=(deaths-prev_deaths);
				let diff_recovered=(recovered-prev_recoverd);
				
				//add data to table 
				if(diff_confirm>0)
				{
					confirm_pic=confirmed+increases+diff_confirm;
				}
			    else if(diff_confirm<0)
			    {
			    	confirm_pic=confirmed+decreases+Math.abs(diff_confirm);
			    }
			    else
			    {
			    	confirm_pic=confirmed
			    }
			    if(diff_deaths>0)
			    {
			    	deaths_pic=deaths+ increases+Math.abs(diff_deaths);
			    }
			    else if(diff_deaths<0)
			    {	
			    	deaths_pic=deaths+decreases+Math.abs(diff_deaths);
			    }
			    else
			    {
			    	deaths_pic=deaths
			    }
			    if(diff_recovered>0)
			    {
			    	//green up arrow for postive result 
			    	let increases="<img src="+upgreen_img_src+" height='12px' width='12px'><span style='font-size:.5rem;'>"
			    	recovered_pic=recovered+ "<br>"+increases+diff_recovered;
			    }
			    else if(diff_recovered<0)
			    {
			    	recovered_pic=recovered+"<br>"+decreases+Math.abs(diff_recovered);	
			    }
			    else
			    {
			    	recovered_pic=recovered+"<br>"
			    }
			    //retriving state value 
			    let district_name=data_array[4];
			     //push to array for search 
			    district_name_array.push(district_name.toLowerCase());
			    //split with space and add only first one and remove dot from it 
			    let class_name=district_name.split(" ")[0].toLowerCase();
			  	
				let district_html="<div class='district-div "+class_name+"'>								\
						  			<p class='district-name'>"+district_name+"<br>"+date+"</p>					\
						  			<div class='district-data d-flex flex-wrap justify-content-between' >			\
						  				<div class='active-district'>Active<br><span id='active-no'>"+active+"</span></div>\
						  				<div class='confirmed-district'>Confirmed<br><span id='active-no'>"+confirm_pic+"</span></div>\
						  				<div class='recovered-district'>Recovered<br><span id='active-no'>"+recovered_pic+"</span></div>\
						  				<div class='deaths-district'>Deaths<br><span id='active-no'>"+deaths_pic+"</span></div><br>\
						  			</div>"
					
					$(".district-container").append(district_html);

		}
		
}
function searchdistrict()
{
	let search_val=$("#search-input").val().toLowerCase();
	$("#search-input").val(search_val.toUpperCase());
	$.each(district_name_array,function(index,district_name){
				//split the class name if it has space 
				let class_name=district_name.split(" ")[0].replace(".","")
				if(district_name.startsWith(search_val))
				{
					$("."+class_name).addClass("show");
					$("."+class_name).removeClass("hide");
				}
				else
				{
					$("."+class_name).addClass("hide");
				}
	});
}
getAllData();
