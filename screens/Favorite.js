import React, {useState, useEffect, useRef} from 'react';
import { View,Text, Pic, List } from '../components';
import CirclePercent from '../svg/CirclePercent';
import {Animated,Easing, Dimensions, PanResponder, TouchableOpacity} from 'react-native';
import { theme, tabs } from '../constants';
import { FetchFavorite } from '../database/favorite';

let swipeTO = null;
let timeOut = null;
let isSwipe = false;

let swipeTO_cat = null;
let timeOut_cat = null;
let isSwipe_cat = false;

let currentTop = 0;
let offsetX = 0;
let bearAnim = null;
let currentMiddle = 0;

let category_change = 0;
let isTutorial = false, swipeTut = true;
let tutorialLevel = -1, TutDelayTime = 1000, tutStart = false;
const TUTORIAL = 0;
const { width, height } = Dimensions.get('window');

function TutorialFinger(props){
    const animated = useRef(new Animated.Value(1.1)).current;
    const swipe_animated = useRef(new Animated.Value(0)).current;
    let circle_trans = null;
    const { swipe, tap, upward } = props;
    let picstyle = null;
    if(tap){
        picstyle = {transform: [{scale: animated}]};
        const animatedStart =()=> {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animated,{
                        toValue: 1,
                        duration: 1000,
                    }),
                    Animated.timing(animated,{
                        toValue: 1.1,
                        duration: 1000,
                    })
                ])
            ).start();
        }
        animatedStart();
    }
    if(swipe && !upward){

        picstyle = {transform: [{ translateX: swipe_animated},{scale: animated}]};
        circle_trans = {transform: [{translateX: swipe_animated}]}
        const animatedStart =()=> {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animated,{
                        toValue: 1,
                        duration: 1000,
                    }),
                    Animated.timing(swipe_animated,{
                        toValue: 100,
                        duration: 3000,
                    }),
                    
                    Animated.timing(animated,{
                        toValue: 1.1,
                        duration: 1000,
                    }),
                ])
            ).start();
        }
        animatedStart();
    }
    
    if(swipe && upward){

        picstyle = {transform: [{ translateY: swipe_animated},{scale: animated}]};
        circle_trans = {transform: [{translateY: swipe_animated}]}
        const animatedStart =()=> {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animated,{
                        toValue: 1,
                        duration: 1000,
                    }),
                    Animated.timing(swipe_animated,{
                        toValue: -100,
                        duration: 3000,
                    }),
                    
                    Animated.timing(animated,{
                        toValue: 1.1,
                        duration: 1000,
                    }),
                ])
            ).start();
        }
        animatedStart();
    }
    return(
        <View flex={false} absolute style={props.style}>
            { tap || swipe? <Circle size={40}
             absolute animated style={[circle_trans,{
                
                top: -10,
                left: 5,
                opacity: animated.interpolate({
                    inputRange: [1,1.1],
                    outputRange: [0.1,0],
                    extrapolate: 'clamp'
                })
            }]}/>:null}
            <Pic
            animated
            style={picstyle}
            src={require('../assets/icons/tutorial_finger.png')}
            size={[70,70]}
            />
        </View>
    )
}
const ProceedTutorial =(navigation)=>{
    navigation.navigate('InfoModal',{info: 
        {
        text: 'Test',
        }, 
        button: [
            {
                title: 'Ok',
                navigate: 'Favorite',
                purpose: TUTORIAL,
            },
            ],  
        exit: false,
        });
}

function FavoriteList(props){
    const {current,setCurrent, navigation,data, scrollX} = props;
    const listRef = useRef();


    const getMiddleItemLayout =(data, index) =>{
        let size = width-(width*0.6);
    
        return  { length: 10, width: size, offset: size * index, index }
    }

    const ListView = (props) =>{
        const {item, index} = props;
        
        const tabsIndex = item.tabsIndex;
        const mocksIndex = item.mocksIndex;
        const mocksData = tabs.cuisine.uppedTabs[tabsIndex].mocks[mocksIndex].recipe;
        const {image} = mocksData;


        const stepPosition = Animated.divide(scrollX,width - (width * .6));
        const sizeChange = stepPosition.interpolate({
            inputRange: [index-1,index,index+1],
            outputRange: [width-(width*0.6),width-(width*0.5),width-(width*0.6)],
            extrapolate: 'clamp',
        })
        return(
            <View flex={false} touchable activeOpacity={1} onPress={()=>{
                if(offsetX != index || currentMiddle != index){
                    listRef.current.scrollToIndex({index, animated: true });
                }else{
                    mocksData.mocks_tabs = tabsIndex;
                    navigation.navigate('CuisineSelected', {item: mocksData, index: mocksIndex});
                }
                }}
                > 
                <Pic
                        animated
                        src={image}
                        size={[sizeChange,sizeChange]}
                />
            </View>
        );
    }

    return(
        <View 
        animated
        style={{zIndex: scrollX.interpolate(
            {
                inputRange:[0,10],
                outputRange: [0,2],
                extrapolate: 'clamp',
            }
        )}}
        >
            <List 
            horizontal
            ref={listRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingStart: 100,paddingEnd: 100}}
            renderItem={({item, index})=> <ListView item={item} index={index}/>}
            keyExtractor={(item,index)=> index.toString()}
            data={data}
            getItemLayout={getMiddleItemLayout}
            onScroll={
                Animated.event(
                    [{nativeEvent: {contentOffset: {x: scrollX}}}],
                    {
                        listener: event => {

                            const x = event.nativeEvent.contentOffset.x / (width - (width * .60));
                            offsetX =Math.floor(x);
                            //console.log(event.nativeEvent.contentOffset.x );
                            if(x%1 >= 0.0 &&  x%1 <= 0.1){
                                currentMiddle = offsetX == -1 ? 0 : offsetX;
                                
                                isSwipe = true;
                                if(swipeTO != null)
                                    clearTimeout(swipeTO);
                                    
                                swipeTO = setTimeout(() => {
                                    isSwipe = false;
                                }, 10);
                                
                                if(timeOut != null)
                                clearTimeout(timeOut);
                                
                                if(offsetX != current ){
                                    timeOut = setTimeout(() => {
                                        setCurrent(offsetX == -1 ? 0 : offsetX);
                                    }, 500);
                                }
                            }else{
                                currentMiddle = -1;
                            }
                        }
                    }
                )
            }
        />

        </View>
        
    );
}

function DistinctionList(props){
    
    const {scrollX, category, setCategory} = props;
    const distScroll = useRef(new Animated.Value(0)).current;
    const listRef = useRef();

    const ListView =(props)=> {
        const {item, index} = props;
        const selectAnimated = Animated.divide(distScroll, 23);
        return(
            <TouchableOpacity activeOpacity={1} onPress={()=>{
                 listRef.current.scrollToIndex({index, animated: true });
            }}
            >
                <Text animated center size={16} style={{
                    color:selectAnimated.interpolate({
                        inputRange: [index-1, index, index+1],
                        outputRange: ['#C7C6C6','#FF6600','#C7C6C6'],
                        extrapolate: 'clamp',
                    })
                }} family='semi-bold'>{item}</Text>
            </TouchableOpacity>
        )
    }
    
    const getItemLayout =(data, index) =>{
        let size = 23;
    
        return  { length: size, height: size, offset: size * index, index }
    }

    return(
        <View flex={false} animated
        absolute
        top={height * 0.09}
        left={20}
        style={{height: height * 0.09,zIndex:1, 
            opacity: scrollX.interpolate({
                inputRange: [0,150],
                outputRange: [1,0],
                extrapolate: 'clamp',
            })
        }}>
            <List
            ref={listRef}
            data={tabs.favorites.sideTabs}
            getItemLayout={getItemLayout}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingTop: 25,paddingBottom: 50}}
            renderItem={({item, index}) => <ListView item={item} index={index}/>}
            keyExtractor={(item,index)=> index.toString()}
            onScroll={
                Animated.event(
                    [{nativeEvent: {contentOffset: {y: distScroll}}}],
                    {
                        listener: event => {
                            const y = event.nativeEvent.contentOffset.y /23;
                            const offsetY =Math.round(y);
                            //console.log(event.nativeEvent.contentOffset.x );
                            
                           // console.log(offsetY);
                            isSwipe_cat = true;
                            if(swipeTO_cat != null)
                                clearTimeout(swipeTO_cat);
                                
                            swipeTO_cat = setTimeout(() => {
                                isSwipe_cat = false;
                            }, 10);
                            
                            if(timeOut_cat != null)
                            clearTimeout(timeOut_cat);
                            
                            if(offsetY != category ){
                                timeOut_cat = setTimeout(() => {
                                    setCategory(offsetY == -1 ? 0 : offsetY);
                                }, 500);
                            }
                        }
                    }
                )
            }
        />

        </View>
        

    );
}

function Favorite({navigation}){
    const animated = useRef(new Animated.Value(0)).current;
    const scrollX = useRef(new Animated.Value(0)).current;
    
    const zOpacity_1 = useRef(new Animated.Value(0)).current;
    const zOpacity_2 = useRef(new Animated.Value(0)).current;
    const zOpacity_3 = useRef(new Animated.Value(0)).current;
    const zOpacity_4 = useRef(new Animated.Value(0)).current;

    const [category, setCategory] = useState(0);
    const [current, setCurrent] = useState(0);
    const [data, setData] = useState([]);
    category_change = category;
    let onStart = false;
    const TutorialModal =()=>{
        navigation.navigate('InfoModal',{info: 
            {
            text:'You have current tutorial at ' + tabs.tutorial.current + '\ntab I will navigate you back'
            }, 
            button: [
                {
                    title: 'Ok',
                    navigate: tabs.tutorial.current
                },
                ],  
            exit: false,
            });
    }
    const StartTutorial =()=>{
        navigation.navigate('InfoModal',{info: 
            {
            text: 'Hello! there ^.^ \nbefore you start using the app\nyou will have a short tutorial.'
            }, 
            button: [
                {
                    title: 'Ok',
                    navigate: 'Favorite',
                    purpose: TUTORIAL,
                },
                ],  
            exit: true,
            });
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {

            if(!tabs.tutorial.favorite){
                tabs.variables.active = tabs.tutorial.curr_num;
                tabs.variables.tutorial_proceed = true;
                TutorialModal();
            }
            if(tabs.tutorial.favorite && tabs.tutorial.current == 'Favorite' && tutorialLevel == -1 && !isTutorial){
                isTutorial = true;
                tabs.variables.active = 1;
                tabs.variables.tutorial_proceed = true;
                StartTutorial();
            }
            
            FetchFavorite(setData, category_change);
        });
        onStart = true;
        
        const z_loop =()=>{
            return  Animated.loop(Animated.sequence([
                Animated.timing(zOpacity_1,{
                    toValue: 1,
                    duration: 500,
                }),
                Animated.timing(zOpacity_2,{
                    toValue: 1,
                    duration: 500,
                }),
                Animated.timing(zOpacity_3,{
                    toValue: 1,
                    duration: 500,
                }),
                Animated.timing(zOpacity_4,{
                    toValue: 1,
                    duration: 500,
                }),
                
                Animated.timing(zOpacity_1,{
                    toValue: 0,
                    duration: 400,
                }),
                
                Animated.timing(zOpacity_2,{
                    toValue: 0,
                    duration: 400,
                }),
                Animated.timing(zOpacity_3,{
                    toValue: 0,
                    duration: 400,
                }), 
                Animated.timing(zOpacity_4,{
                    toValue: 0,
                    duration: 400,
                }),
            ]));
        }
            
        bearAnim = z_loop();
        bearAnim.start();
          return unsubscribe;
      }, [navigation]);
    
      
    const BearLoading =()=>{
        return(

            <View center middle>
            <View flex={false}>
                <View flex={false} paddingLeft={50} marginBottom={-15}>
                    <Pic
                        animated
                        src={require('../assets/icons/bear/z4.png')}
                        size={[17.24,21.81]}
                        style={{marginLeft: 35,opacity: zOpacity_4}}
                    />
                    <Pic
                        animated
                        src={require('../assets/icons/bear/z3.png')}
                        size={[13.73,15.57]}
                        style={{marginLeft: 20,opacity: zOpacity_3}}
                    />
                    <Pic
                        animated
                        src={require('../assets/icons/bear/z2.png')}
                        size={[9.9,12.59]}
                        style={{marginLeft: 10,opacity: zOpacity_2}}
                    />
                        
                    <Pic
                        animated
                        src={require('../assets/icons/bear/z1.png')}
                        size={[9.81,10.94]}
                        style={{opacity: zOpacity_1}}

                    />


                </View>
            
                <Pic
                    src={require('../assets/icons/bear/body.png')}
                    size={[200,100]}
                />
            </View>
            <Text secondary aregular size={25} top={20}>Dreaming of what to cook</Text>
            <Text secondary aregular size={15} top={3}>You didn't favorite anything on <Text abold >{tabs.favorites.sideTabs[category]}</Text>.</Text>
            </View>
        );
    }
    
    useEffect(() => {
        if(!onStart){
            console.log('test2');
            FetchFavorite(setData, category);
        }
    }, [category]);

    let tabsIndex = null;
    let mocksIndex = null;
    let mocksData = null;
    const isData = data.length != 0 ? true : false;
    if(isData){

        tabsIndex = data[current].tabsIndex;
        mocksIndex = data[current].mocksIndex;
        mocksData = tabs.cuisine.uppedTabs[tabsIndex].mocks[mocksIndex].recipe;
        
    }else{
        if(bearAnim != null){
            bearAnim.start();
        }
    }

    const CuisineInfo =props=>{
        return(
            <View middle flex={false}>

                <Text family='semi-bold' color='#8F8F8F' size={16} bottom={5} 
                    style={{width: '80%'}}
                    center
                >{mocksData.name}</Text>
                <View flex={false} row>
                    <Pic
                        src={require('../assets/images/chopping-knife.png')}
                        size={[25,25]}
                        marginRight={5}
                    />
                    <Text end asemi_bold size={14} thirdary>{mocksData.prep_time}</Text>
                    <Text end asemi_bold size={13} gray3> preparation</Text>
                    <Pic
                        accent
                        src={require('../assets/images/time.png')}
                        size={[25,25]}
                        marginRight={5}
                        marginLeft={5}
                    />
                    <Text end asemi_bold size={14} thirdary>{mocksData.cooking_time}</Text>
                    <Text end asemi_bold size={13} gray3> cooking</Text>
                </View> 
                <View row flex={false}>

                    <View row flex={false}>
                        <Pic
                                accent
                                src={require('../assets/images/people.png')}
                                size={[25,25]}
                                marginRight={5}
                            />
                        <Text end asemi_bold size={14} thirdary>{mocksData.capacity} people</Text>
                    </View>
                    <View row flex={false} marginLeft={10}>
                        <Pic
                                accent
                                src={require('../assets/images/fire.png')}
                                size={[20,20]}
                                marginTop={5}
                                marginRight={5}
                            />
                        <Text end asemi_bold size={14} thirdary>{mocksData.burn}</Text>
                    </View>

                </View>
            </View>
        )
    }
    const QuickInfo =props=>{
        const { current } = props;
        return(
            <View flex={false} >
                <Text color='#FF6600' family='extra-bold' size={25} bottom={10} top={10}>Quick Info</Text>
                 <Text color='#727272' size={14}>{mocksData.description}</Text>
            </View>
        );
    }
    
    return(
        <View white paddingTop={isData ? theme.sizes.padding*2: 0}>
        <DistinctionList scrollX={scrollX} category={category} setCategory={setCategory}/>
        { isData ? <View>
            <View flex={0.5}>
                <FavoriteList scrollX={scrollX} current={current} setCurrent={setCurrent} navigation={navigation} data={data}/>
            </View>
                     <View flex={false}>
                    <CuisineInfo />
                </View>
                    
                <View>
                    <View flex={false} paddingHorizontal={20}paddingBottom={10}>
                        <QuickInfo current={current}/>
                    </View>
                    <View flex={false} paddingHorizontal={16} >
                        <View flex={false} row>
                            <CirclePercent size={-30} name={mocksData.circle_1.name} rotate={mocksData.circle_1.degree} percent={mocksData.circle_1.percent/100} textSize={.17} textColor={mocksData.circle_1.textColor} gradient={mocksData.circle_1.gradient} />
                            <View flex={false} absolute right={5}>
                                <CirclePercent size={-30} name={mocksData.circle_3.name} rotate={mocksData.circle_3.degree} percent={mocksData.circle_3.percent/100} textSize={.17} textColor={mocksData.circle_3.textColor} gradient={mocksData.circle_3.gradient} />
                            </View>
                        </View>
                        <View flex={false} marginTop={-40}>
                            <CirclePercent size={-30} name={mocksData.circle_2.name} rotate={mocksData.circle_3.degree} percent={mocksData.circle_2.percent/100} textSize={.15} textColor={mocksData.circle_2.textColor} gradient={mocksData.circle_2.gradient} />
                        </View>
                    </View>
                </View> 
        </View> : null }

        {!isData ?<BearLoading/>: null}
        </View>
    );
}


export default Favorite;
