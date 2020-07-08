import React,{useState, useEffect} from 'react';
import { View, List,Text, Card } from '../components';
import { ScrollView } from 'react-native-gesture-handler';
import { theme } from '../constants';
import { CheckBox } from 'react-native-elements';
import { AddNote, DropTable,SeeData ,InitialData, DataPos, _1_NextPage, _2_NextPage, UpdateTable, QueryChanges, QueryChangesList, _1_SelectCheckList,_2_SelectCheckList, SetFirstNote, GetFirstNote, RemovePos } from '../database/database'

/*
const data1 = [
   {
        title:'Today\'s Ingrideints', 
        date: '14 April',
        color: '#5682FF',
        note: '1. 3pcs Onion\n'+
              '2. 5pcs Chicken\n'+
              '3. 1pcs of Pepper',
        isNote: true,
        isCheckList: false,
        checkList: [{_text: '', status: 0 }],
    },
    {
        title:'Grocery List', 
        date: '20 Sept',
        color: '#FFA2A2',
        note: 'By the end of the day I must go buy sum of the important ingridients',
        isNote: true,
        isCheckList: false,
        checkList: [{_text: '', status: 0 }],
    }
]
*/
/*
const data2 = [
   {
        title:'Shopping Items', 
        date: '20 Dec',
        color: '#FF84DF',
        note: '',
        isNote: true,
        isCheckList: true,
        checkList: [
            {
                _text: 'Pork',
                status: 0,
            },
            {
                _text: 'Mama Sita',
                status: 0,
            },
            {
                _text: 'Lola Remedios',
                status: 0,
            },
            {
                _text: 'Oister Sauce',
                status: 0,
            },
            {
                _text: 'Tocino',
                status: 0,
            },
        ]
    },
    {
        title:'Birthday Plan', 
        date: '14 April',
        color: '#8685FF',
        note: 'Luluto ng sphagettin tapos pansit sa mga kapitbahay',
        isNote: true,
        isCheckList: false,
        checkList: [{_text: '', status: 0 }],
    },
]*/

let _1_data = true;
let _2_data = true;
let _1_latest_offset_data = 0;
let _2_latest_offset_data = 0;
let _1_id_latest_data = 1;
let _2_id_latest_data = 1;

function Ingridients({navigation, route}){
    console.log('agaha');

    const [stateData1, setStateData1] = useState([]);
    const [stateData2, setStateData2] = useState([]);
    const [isFirstRow,setIsFirstRow] = useState(true);
    const [firstItem, setFirstItem] = useState(null);
    const monthsText = ['Jan','Feb','March','April','May','Jun','July','Aug','Sept','Oct','Nov','Dec'];
    const date =  new Date().getDate() +" " + monthsText[new Date().getMonth()];
    
    useEffect(()=> {
        if(stateData1.length != 0 && _1_data){
            
            for(let i = _1_latest_offset_data; i < stateData1.length; i++){
                _1_SelectCheckList(stateData1[i],stateData1,setStateData1, i);
            }
            _1_latest_offset_data = stateData1.length;
            _1_id_latest_data = stateData1[0].id+1;
            _1_data = false;
        }
    },[stateData1]);
    
    useEffect(()=> {
        if(stateData2.length != 0 && _2_data){
            
            for(let i = _2_latest_offset_data; i < stateData2.length; i++){
                _2_SelectCheckList(stateData2[i],stateData2,setStateData2, i);
            }
            
            _2_latest_offset_data = stateData2.length;
            _2_id_latest_data = stateData2[0].id+1;
            _2_data = false;
        }
    },[stateData2]);

  //DeleteAll();
  //DropTable();
  SeeData();
  //RemovePos();
    useEffect(() => {
       GetFirstNote(setFirstItem);
       InitialData({setStateData1, setStateData2, setIsFirstRow, stateData1, stateData2 });
        if (route.params?.post) {
            const {index, post, type} = route.params; 

            if(index == -1){
                if(firstItem == null){
                    SetFirstNote(post);
                    setFirstItem([post]);
                }
                else{
                    const setData = isFirstRow ? setStateData1 : setStateData2;
                    if(isFirstRow){_1_id_latest_data++;} else { _2_id_latest_data++;}
                    setData(items=>[post,...items])
                    setIsFirstRow(isFirstRow ? false : true); 
                    DataPos(isFirstRow);
                    AddNote(post,isFirstRow);
                }

            }else{
                let updateData = null, save = null;
                switch(type){
                    case 0: 
                        setFirstItem([post]);
                        SetFirstNote(post);
                        break;
                    case 1: 
                        updateData = stateData1;
                        save = updateData[index];
                        console.log('eco = ',post)
                        updateData[index] = post;
                        setStateData1( items=>[...updateData]);
                        UpdateTable(QueryChanges({save, post}), post.id.toString(),1);
                        QueryChangesList({save, post},1);
                        break;
                    case 2: 
                        updateData = stateData2;
                        save = updateData[index];
                        console.log('eco = ',post)
                        updateData[index] = post;
                        setStateData2( items=>[...updateData]);
                        UpdateTable(QueryChanges({save, post}), post.id.toString(),2);
                        QueryChangesList({save, post},2);
                        break;
                }
                
            }      
        }
    }, [route.params?.post]);


    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 0;
        return layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom;
    };



    const CheckList =props=>{
        const { item, stateData, mainIndex, table_type } = props;
        const { data, setData } = stateData;

        const changeChecked =(index)=>{
            if(table_type == -1){
                item.checkList[index].status = item.checkList[index].status ? 0 : 1;
                SetFirstNote(item);
                return;
            }
            setTimeout(()=>{
                let updatedData = data;
                updatedData[mainIndex].checkList[index].status = updatedData[mainIndex].checkList[index].status ? 0 : 1;
                UpdateTable(" status = " + updatedData[mainIndex].checkList[index].status, updatedData[mainIndex].checkList[index].id,table_type);
                setData(items=> [...updatedData]);
            }, 1)
            
        }
        
        const CheckItemView =props=>{
            const { item,index } = props;
            const [checked, setChecked] = useState(item.status? true: false);
            return(
                <View row>
                <CheckBox checked={checked} size={20} checkedColor='white' uncheckedColor='white'  containerStyle={{width: 30,height: 20, marginLeft: -10}} 
                    onPress={()=> { setChecked(checked ? false : true); changeChecked(index); }}
                    />
                <Text size={12} white family='bold' top={5} left={-3} >
                    {item._text}</Text> 
                </View>
            );  
        }

        if(item.checkList != null){
            return(
                item.checkList.map( (item, index) => <CheckItemView key={index.toString()} item={item} index={index}/> )      
            );
        }
        return null
    }

    return(
        <View white>


            <View flex={15} paddingTop={30} row>
                <ScrollView
                  onScroll={({nativeEvent}) => {
                    if (isCloseToBottom(nativeEvent)) {
                        _1_data = true;
                        _2_data = true;
                        _1_NextPage(setStateData1);
                        _2_NextPage(setStateData2);
                    }
                  }}
                  scrollEventThrottle={400}
                >

                {
                    firstItem != null ? 
                        
                    <Card inTouchable round={25} color={firstItem[0].color} padding={theme.sizes.padding} accent marginX={[20,20]} marginBottom={8}
                         inPress={()=>navigation.navigate('NoteEditor',{currentNote: firstItem[0], index: 0, type : 0}) }
                    >
                        <Text size={18} white family='bold' bottom={theme.sizes.padding/2}>{firstItem[0].title}</Text>
                        <Text size={11} white family='semi-bold' >{firstItem[0].note}</Text>
                        { firstItem[0].isCheckList ? <CheckList item={firstItem[0]}  mainIndex={0} stateData={{data: firstItem,setData: setFirstItem}} table_type={-1} /> : null}
                        <Text size={12} white family='bold' >{null}</Text>
                        <Text size={12} white end top={20}>12 Feb</Text>
                    </Card>
                    : 
                    null 
                }
                    
                <View row flex={1}>

                        <View flex={1} >
                            {stateData1.map(
                                (item,index) => (
                                    <View flex={false} key={index.toString()} marginBottom={8} width='85%' end marginRight={8}  >
                
                                        <Card inTouchable round={25} color={item.color} padding={theme.sizes.padding} accent 
                                              inPress={()=>navigation.navigate('NoteEditor',{currentNote: item, index, type : 1}) }>
                                            <Text size={18} white family='bold' bottom={theme.sizes.padding/2}>{item.title}</Text>
                                           {item.isNote ?  <Text size={11} white family='semi-bold' bottom={10} numberOfLines={10} ellipsizeMode='tail'>{item.note}</Text> : null }
                                           { item.isCheckList ? <CheckList item={item}  mainIndex={index} stateData={{data: stateData1,setData: setStateData1}} table_type={3} /> : null}
                                            <Text size={12} white end top={20}>{item.date}</Text>
                                        </Card>
                                    </View>
                                )
                            )}
    
                        </View>

                        <View flex={1} >
                            {stateData2.map(
                                (item,index) => (
                                  
                                <View flex={false} key={index.toString()} marginBottom={8} width='85%' >
                                    
                                    <Card inTouchable round={25} color={item.color} padding={theme.sizes.padding} accent
                                        inPress={()=>navigation.navigate('NoteEditor',{currentNote: item, index, type : 2}) }
                                    >
                                        <Text size={18} white family='bold' bottom={theme.sizes.padding/2}>{item.title}</Text>
                                        {item.isNote ? <Text size={11} white family='semi-bold' >{item.note}</Text> : null }
                                        { item.isCheckList ? <CheckList item={item} mainIndex={index} stateData={{data: stateData2, setData: setStateData2}} table_type={4}/> : null}
                                        <Text size={12} white end top={40}>{item.date}</Text>
                                    </Card>

                                </View>
                            )
                             )}

                        </View>
                        

                    
                </View>


                </ScrollView>

            </View>
            
            <View  center middle >
                <Card touchable round={50} accent size={[100]} center middle row
                    press={()=> navigation.navigate('NoteEditor',{currentNote: {id: isFirstRow ? _1_id_latest_data : _2_id_latest_data,title: '', note: '', date ,isNote: true,isCheckList: false , color: theme.colors.accent, checkList: [{_text: '', status: false}]}, index: -1}) }
                >
                    <Text family='semi-bold' size={18} white>Create</Text>
                </Card>
            </View>
        </View>
    );
}

export default Ingridients;