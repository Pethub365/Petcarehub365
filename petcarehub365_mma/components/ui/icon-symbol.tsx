import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'cart.fill': 'shopping-cart',
  'person.fill': 'person',
  'magnifyingglass': 'search',
  'bell.fill': 'notifications',
  'heart.fill': 'favorite',
  'paw.fill': 'pets',
  'calendar': 'event',
  'star.fill': 'star',
  'mappin': 'location-on',
  'gearshape.fill': 'settings',
  'chart.bar.fill': 'leaderboard',
  'bag.fill': 'shopping-bag',
  'lock.fill': 'lock',
  'globe': 'language',
  'moon.fill': 'dark-mode',
  'ruler.fill': 'straighten',
  'questionmark.circle.fill': 'help',
  'questionmark.circle': 'help-outline',
  'envelope.fill': 'mail',
  'doc.text.fill': 'description',
  'rectangle.portrait.and.arrow.right': 'logout',
  'line.3.horizontal': 'menu',
  'plus': 'add',
  'fork.knife': 'restaurant',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.circle': 'check-circle-outline',
  'figure.walk': 'directions-walk',
  'scissors': 'content-cut',
  'face.smiling': 'sentiment-satisfied',
  'syringe.fill': 'vaccines',
  'checkmark': 'check',
  'xmark': 'close',
  'trophy.fill': 'emoji-events',
  'crown.fill': 'workspace-premium',
  'creditcard': 'credit-card',
  'square.and.arrow.up': 'ios-share',
  'play.circle.fill': 'play-circle',
  'lightbulb.fill': 'lightbulb',
  'person.3.fill': 'groups',
  'person.badge.plus': 'person-add',
  'checkmark.seal.fill': 'verified',
  'ellipsis': 'more-horiz',
  'square.grid.2x2.fill': 'grid-view',
  'checklist': 'checklist',
  'heart.text.square.fill': 'monitor-heart',
  'thermometer': 'thermostat',
  'camera.fill': 'camera-alt',
  'cross.case.fill': 'medical-services',
  'sparkles': 'auto-awesome',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] as any || 'help-outline'} style={style} />;
}
