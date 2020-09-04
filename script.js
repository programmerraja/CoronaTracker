//global var to store the state name 
var state_name_array=[];
function getAllData(argument) {
	/*
		getting data from api which has  "cases_time_series"  "statewise" and "tested" details we only need statewise details
	*/
	var alldatalink="https://api.covid19india.org/data.json";
	$.getJSON(alldatalink,function(data){
		// storing prev day val for calculation of total value in india 
		let prev_index=data["cases_time_series"].length;
		let prev_confirm=data["cases_time_series"][prev_index-1]["totalconfirmed"];
		let prev_recoverd=data["cases_time_series"][prev_index-1]["totalrecovered"];
		let prev_deaths=data["cases_time_series"][prev_index-1]["totaldeceased"];
		
		//iterating only statewise object
		$.each(data["statewise"],function(index,data){
			//storing value for calculation
			let active=data["active"];
			let date=data["lastupdatedtime"].split(" ")[0];
			let confirmed=data["confirmed"];
			let recovered=data["recovered"];
			let deaths=data["deaths"];
			//adding the today  status of covid 
			if(data["state"]==="Total")
			{
				//call function wit isstatus =1 
			 	addDataToTable([active,date,confirmed,recovered,deaths],[prev_confirm,prev_recoverd,prev_deaths],1);	
			}
			//pushing the state details to table 
			else
			{
				//to change date fromat 
				date=date.split("/").reverse().join("-")
				//call function to get prev  day data 
				getPrevDayData(date,data["statecode"],[active,date,confirmed,recovered,deaths,data["state"]])	 
			}
		})	
	})
}
function getPrevDayData(tdate,statecode,data_array) {
	let prevdate=tdate.split("-");
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
	//store prev day data in array 
	let prev_data_array=[]
	fetch(link).then((response) => {
    					return response.json()
  						}).then((data) =>{
								if(data[statecode]!==undefined)
								{
								  
									    if(data[statecode]["total"]["confirmed"]===undefined)
										{			    
									     	prev_data_array.push(0)
										}
										else
										{
											prev_data_array.push(data[statecode]["total"]["confirmed"])
										}
									    if(data[statecode]["total"]["recovered"]===undefined)
									    {
										    prev_data_array.push(0)
										}
										else
										{
											prev_data_array.push(data[statecode]["total"]["recovered"])
										}			    
									    //if none one died pushing zero 
										if(data[statecode]["total"]["deceased"]===undefined)
									    {
										    prev_data_array.push(0)
										}
										else
										{
												prev_data_array.push(data[statecode]["total"]["deceased"])
										}
										//call functio to add data to tabel isstatus =0
										addDataToTable(data_array,prev_data_array,0);
								}
							    }).catch(()=>{});
}
function addDataToTable(data_array,prev_data_array,isstatus)
{
				//retrive the valu from array 
				let active=data_array[0];
				let date=data_array[1];
				let confirmed=data_array[2];
				let recovered=data_array[3];
				let deaths=data_array[4];

				let prev_confirm=prev_data_array[0]
				let prev_recoverd=prev_data_array[1]
				let prev_deaths=prev_data_array[2]

				//calculating the difference 
				let diff_confirm=(confirmed-prev_confirm);
				let diff_deaths=(deaths-prev_deaths);
				let diff_recovered=(recovered-prev_recoverd);

				//  img src 
				let up_img_src="image/upimg.png";
				let down_img_src="image/downimg.png";
				let upgreen_img_src="image/upgreenimg.png"
	

				let increases="<br><img src="+up_img_src+" height='12px' width='12px'><span style='font-size:.7rem;'>"

				let decreases="<br><img src="+down_img_src+" height='12px' width='12px'><span style='font-size:.7rem;'>"
				//checking if it add to satus or table 
				if(isstatus==1)
				{
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
				//add data to table 
				else
				{
					
					if(diff_confirm>0)
					{
						confirm_pic=confirmed+increases+diff_confirm;
					}
				    else if(diff_confirm<0)
				    {
				    	confirm_pic=confirmed+decreases+Math.abs(diff_confirm);
				    }
				    if(diff_deaths>0)
				    {
				    	deaths_pic=deaths+increases+Math.abs(diff_deaths);
				    }
				    else if(diff_deaths<0)
				    {	
				    	deaths_pic=deaths+decreases+Math.abs(diff_deaths);
				    }
				    if(diff_recovered>0)
				    {
				    	let increases="<br><img src="+upgreen_img_src+" height='12px' width='12px'><span style='font-size:.7rem;'>"
				    	recovered_pic=recovered+increases+diff_recovered;
				    }
				    else if(diff_recovered<0)
				    {
				    	recovered_pic=recovered+decreases+Math.abs(diff_recovered);	
				    }
				    //retriving state value 
				    let state_name=data_array[5]
				  	state_name_array.push(state_name.toLowerCase())
				  	let class_name=state_name.split(" ")[0].toLowerCase();
					let state_html="<div class='state-div "+class_name+"' >						\
						  			<p class='state-name' onclick='goToState(event)'>"+state_name+"<br>"+date+"</p>	\
						  			<div class='state-data d-flex flex-wrap justify-content-between' >			\
						  				<div class='active-state'>Active<br><span id='active-no'>"+active+"</span></div>\
						  				<div class='confirmed-state'>Confirmed<br><span id='active-no'>"+confirm_pic+"</span></div>\
						  				<div class='recovered-state'>Recovered<br><span id='active-no'>"+recovered_pic+"</span></div>\
						  				<div class='deaths-state'>Deaths<br><span id='active-no'>"+deaths_pic+"</span></div><br>\
						  			</div>"
					
					$(".state-container").append(state_html);
				}
}
function goToState(event)
{ 
	//it return total text 
	let array=event.target.nextSibling.nextSibling.innerText.split("\n");
	let tactive=tconfirmed=trecovered=tdeaths=diff_confirm=diff_recovered=diff_deaths=0;
	if(array[1])
	{
		 tactive=array[1];
	}
	if(array[3])
	{
		 tconfirmed=array[3];
	}
	if(array[4])
	{
		 diff_confirm=array[4];
	}
	if(array[6])
	{
		 trecovered=array[6];
	}
	if(array[7])
	{
		 diff_recovered=array[7];
	}
	if(array[9])
	{
	 tdeaths=array[9];
	}
	if(array[10])
	{
		 diff_deaths=array[10];
	}
	
	//store all data as single object 
	let state_data={"tactive":tactive,"tconfirmed":tconfirmed,"trecovered":trecovered,"tdeaths":tdeaths,
					"diff_confirm":diff_confirm,"diff_recovered":diff_recovered,"diff_deaths":diff_deaths};

	//getting state 	
	let state_name =event.target.innerText.split("\n")[0];
	let prevdate= event.target.innerText.split("\n")[1];
	
	sessionStorage.setItem("state",state_name);
	sessionStorage.setItem("prevdate",prevdate);
	sessionStorage.setItem("state_data",JSON.stringify(state_data));
	window.location="state.html"	
}
function searchState()
{
	let search_val=$("#search-input").val().toLowerCase();
	$("#search-input").val(search_val.toUpperCase());
	$.each(state_name_array,function(index,state_name){
				//split the class name if it has space 
				let class_name=state_name.split(" ")[0]
				if(state_name.startsWith(search_val))
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