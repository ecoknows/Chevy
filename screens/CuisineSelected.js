import React,{useState, useRef} from 'react';
import { View, Text, Pic, Circle, List  } from '../components';
import { PanResponder,StyleSheet, Animated } from 'react-native';
import { theme, directions, } from '../constants';

const DONE = 0;
const START = 1;
let current_step = 0;

function SheetText(props){
    const [ isDirection, setDirection ] = useState(true);
    const [isIndicator, setIsIndicator] = useState(true);
    const [isCurrentStepState, setIsCurrentStepState] = useState(START);
    const { item } = props 
    const { direction, ingridients } = item;


    const IndicatorClick =()=>{
        setIsIndicator(isIndicator ? false : true);
        setIsCurrentStepState( isCurrentStepState ? DONE : START);
        if(isCurrentStepState == DONE)
            current_step++;
    }

    const SheetListView = props => {

        const {item, index} = props;
        let itemColor = null;
        let isCircle = true;
        if ( current_step == index && isCurrentStepState == DONE ) {
            itemColor = theme.colors.accent;
        } else if ( current_step > index){
            itemColor = '#18A623';
            isCircle = false;
        }else{
            itemColor = theme.colors.thirdary;
        }
        const isActive = current_step == index ? true : false;
        const Indicator = isActive ? 
        <View flex={false} size={[33]}>
            <Text size={12} color='#18A623' family='bold' touchable press={IndicatorClick}>
                {isIndicator ? 'Start' : 'Done'}
            </Text>
        </View> : null;

        return(
            <View row>
            {Indicator}
            <View row marginY={[0,20]} marginX={[ isActive ? 15 : 50 ,30]} >
                { isCircle ?
                <Circle color={itemColor == theme.colors.thirdary ? theme.colors.accent : itemColor } size={7} marginY={[5]}/>
                :
                <Pic src={require('../assets/images/check.png')} resizeMode='contain' size={[20,20]}/>
                }
                <Text size={14} color={itemColor} left={5} family='semi-bold'>{item.step}</Text>
            </View>

            </View>
        );
    }

    return(
        <View marginY={[50]} marginX={[theme.sizes.margin * 2,theme.sizes.margin * 2]} >
            <View flex={false} row center marginY={[0,theme.sizes.margin*2]}>
                <Text size={18} family='bold' 
                touchable
                tFlex={1}
                press={()=>setDirection(true)}
                accent={isDirection}
                secondary={!isDirection}
                center
                >Direction</Text>
                
                <Text 
                touchable
                tFlex={1}
                press={()=>setDirection(false)}
                size={18} family='bold'
                accent={!isDirection}
                secondary={isDirection}
                center
                >Ingridients</Text>

            </View>

            <List 
                extraData={isCurrentStepState}
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                data={isDirection ? direction : ingridients}
                renderItem={({ item, index }) =>  <SheetListView item={item} index={index}/>
                }
                keyExtractor={(item,index)=>index.toString()}
                
                contentContainerStyle={{paddingBottom: 200}}
            />

        </View>
    );
}

function CuisineSelected({navigation, route}){
    navigation.setOptions({
        headerShown: false,
    });
    const pan = useRef(new Animated.ValueXY()).current;

    const { item } = route.params;
    const { name , color, cooking_time, prep_time, capacity, burn} = item;
    

    const panResponderTwo = useRef( PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pan.setOffset({
            y: pan.y._value
          });
        },
        onPanResponderMove: Animated.event(
          [
            null,
            { dy: pan.y }
          ]
        ),
        onPanResponderRelease: () => {
          pan.flattenOffset();
        }
      })).current;

      const yAxis = pan.y.interpolate({
        inputRange: [-100,0],
        outputRange: [-100,0],
        extrapolate: 'clamp',
      });

    return(
        <View color={color}  >
            
        <Text touchable end size={30} top={20} right={20}  accent
            press={()=>navigation.goBack()}
         >x</Text>
            <View flex={1} paddingX={[theme.sizes.padding]} >
                <View flex={false}>
                    <Text h2 family='bold'> {name} </Text>
                </View>

                <View row>
                    <View paddingX={[25]}>
                        <View flex={false} row paddingY={[20]}>
                            <Pic 
                                src={require('../assets/images/chopping-knife.png')}
                                size={[33,33]}
                                accent
                            />
                            <Text end family='semi-bold' size={13} thirdary left={0}>{prep_time}</Text>
                            <Text gray3 end family='semi-bold' size={12} thirdary left={0}> preparation</Text>
                        </View>
                        <View flex={false} row paddingY={[20]}>
                            <Pic 
                                src={require('../assets/images/time.png')}
                                size={[25,25]}
                                accent
                            />
                            <Text end family='semi-bold' size={13} thirdary left={7}>{cooking_time}</Text>
                            <Text gray3 end family='semi-bold' size={12} thirdary left={0}> cooking</Text>
                        </View>
                        <View flex={false} row paddingY={[20]}>
                            <Pic 
                                src={require('../assets/images/people.png')}
                                size={[25,25]}
                                accent
                            />
                            <Text end family='semi-bold' size={13} thirdary left={7}>{capacity}</Text>
                        </View>
                        <View flex={false} row paddingY={[20]}>
                            <Pic 
                                src={require('../assets/images/fire.png')}
                                size={[25,25]}
                                accent
                            />
                          <Text end family='semi-bold' size={13} thirdary left={7}>{burn}</Text>
                        </View>

                        <View flex={false} marginLeft={-45} marginTop={25}>
                            
                            <View flex={false} absolute>
                                
                                <Pic 
                                    resizeMode='contain'
                                    src={require('../assets/images/nutrients.png')}
                                    size={[120,40]}
                                    accent
                                />
                                <Text top={9} left={15} absolute white family='bold' size={16}>Nutrients</Text>   
                            </View>

                        </View>
                        

                    </View>


                    <View >
                        <Pic src={require('../assets/images/test.png')}
                            resizeMode='contain'
                            size={[250,250]}
                         />

                    </View>


                </View>
                

            </View>

            
            <View  animated white flex={false} absolute 
            
                    style={[styles.bottomSheet, 
                    {
                        transform: [
                            {
                                translateY: yAxis
                            }
                        ]
                    }
                    ]}
                 >
                    <View 
                    middle
                    flex={false}
                    absolute
                    width='100%'
                    paddingTop={25}
                    color='transparent'
                    height={80}
                     {...panResponderTwo.panHandlers}>
                        <View 
                            color={color}
                            style={styles.indicator}/>
                    </View>
                    <SheetText item={item} />
            </View>

            
        </View>
    );
}

export default CuisineSelected;

const styles = StyleSheet.create({
    bottomSheet : {
        width: '100%',
        height: 500,
        bottom: -150,
        borderRadius: 35,
    },
    indicator: {
        flex: 0,
        height: 8,
        width: 90,
        borderRadius: 20,
    },
});