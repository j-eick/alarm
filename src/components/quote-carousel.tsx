import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  type AnimatedStyle,
  Extrapolation,
  interpolate,
  interpolateColor,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { type Quote, quotesForCategory } from '@/constants/quotes';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

interface QuoteCarouselProps {
  /** `PresetOption.quoteCategory` — key into `quotesForCategory()`. */
  category: string;
  /** The preset's accent color; tints cards + dots + gradients. */
  color: string;
  /** `id` of the quote the user has picked so far (if any) — drawn with a highlighted border. */
  selectedQuoteId: string | null;
  /** Fired when the user taps the already-centered card, marking it as their pick. */
  onSelect: (quote: Quote) => void;
}

/** Groups a flat quote list into pages of (up to) 2 — the foreground pair per page. */
function pairUp(quotes: Quote[]): Quote[][] {
  const pages: Quote[][] = [];
  for (let i = 0; i < quotes.length; i += 2) pages.push(quotes.slice(i, i + 2));
  return pages;
}

const PAGE_GAP = Spacing.two;

/**
 * Swipeable 3D coverflow of quote pairs: the centered page sits crisp and
 * full-scale in the foreground; neighboring pages tilt away via rotateY,
 * shrink, dim, and blur as they recede toward the stage edges, driven live
 * by scroll position. Tapping a neighbor snaps it to center; tapping the
 * already-centered pair selects it.
 */
export function QuoteCarousel({ category, color, selectedQuoteId, onSelect }: QuoteCarouselProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const pages = pairUp(quotesForCategory(category));

  const [activePage, setActivePage] = useState(0);
  const [pagerWidth, setPagerWidth] = useState(0);
  const pagerRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);

  const pageWidth = Math.round(pagerWidth * 0.82);
  const snap = pageWidth + PAGE_GAP;
  const sideInset = (pagerWidth - pageWidth) / 2;

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (snap <= 0) return;
    const idx = Math.max(
      0,
      Math.min(Math.round(e.nativeEvent.contentOffset.x / snap), pages.length - 1),
    );
    setActivePage(idx);
  };

  const goToPage = (p: number) => {
    scrollTo(pagerRef, p * snap, 0, true);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.stage} onLayout={(e) => setPagerWidth(e.nativeEvent.layout.width)}>
        {pagerWidth > 0 && (
          <Animated.ScrollView
            ref={pagerRef}
            horizontal
            decelerationRate="fast"
            snapToInterval={snap}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
            onMomentumScrollEnd={onScrollEnd}
            contentContainerStyle={{ paddingHorizontal: sideInset }}
            style={styles.pager}>
            {pages.map((page, p) => (
              <CarouselPage
                key={p}
                page={page}
                pageIndex={p}
                pageWidth={pageWidth}
                snap={snap}
                scrollX={scrollX}
                activePage={activePage}
                color={color}
                theme={theme}
                scheme={scheme}
                selectedQuoteId={selectedQuoteId}
                onFocus={() => goToPage(p)}
                onSelect={onSelect}
              />
            ))}
          </Animated.ScrollView>
        )}
      </View>

      {pages.length > 1 && (
        <View style={styles.dotsRow}>
          {pages.map((_, p) => (
            <CarouselDot
              key={p}
              pageIndex={p}
              snap={snap}
              scrollX={scrollX}
              color={color}
              inactiveColor={theme.backgroundSelected}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/** One page's worth of the coverflow: its own live tilt/scale/dim/blur, driven by `scrollX`. */
function CarouselPage({
  page,
  pageIndex,
  pageWidth,
  snap,
  scrollX,
  activePage,
  color,
  theme,
  scheme,
  selectedQuoteId,
  onFocus,
  onSelect,
}: {
  page: Quote[];
  pageIndex: number;
  pageWidth: number;
  snap: number;
  scrollX: SharedValue<number>;
  activePage: number;
  color: string;
  theme: ReturnType<typeof useTheme>;
  scheme: 'light' | 'dark';
  selectedQuoteId: string | null;
  onFocus: () => void;
  onSelect: (quote: Quote) => void;
}) {
  const pageStyle = useAnimatedStyle<ViewStyle>(() => {
    const diff = (scrollX.value - pageIndex * snap) / snap;
    return {
      opacity: interpolate(diff, [-1, 0, 1], [0.55, 1, 0.55], Extrapolation.CLAMP),
      transform: [
        { perspective: 800 },
        { rotateY: `${interpolate(diff, [-1, 0, 1], [42, 0, -42], Extrapolation.CLAMP)}deg` },
        { scale: interpolate(diff, [-1, 0, 1], [0.84, 1, 0.84], Extrapolation.CLAMP) },
      ],
    };
  });

  const blurStyle = useAnimatedStyle<ViewStyle>(() => {
    const diff = (scrollX.value - pageIndex * snap) / snap;
    return { opacity: interpolate(Math.abs(diff), [0, 1], [0, 1], Extrapolation.CLAMP) };
  });

  const isCentered = pageIndex === activePage;
  const showBlur = Math.abs(pageIndex - activePage) <= 1;

  return (
    <Animated.View style={[styles.page, { width: pageWidth }, pageStyle]}>
      {page.map((q) => (
        <QuoteCard
          key={q.id}
          quote={q}
          color={color}
          theme={theme}
          scheme={scheme}
          selected={q.id === selectedQuoteId}
          blurStyle={showBlur ? blurStyle : undefined}
          onPress={() => (isCentered ? onSelect(q) : onFocus())}
        />
      ))}
    </Animated.View>
  );
}

/** One dots-row indicator: its highlight color tracks `scrollX` live, in lockstep with the page it represents. */
function CarouselDot({
  pageIndex,
  snap,
  scrollX,
  color,
  inactiveColor,
}: {
  pageIndex: number;
  snap: number;
  scrollX: SharedValue<number>;
  color: string;
  inactiveColor: string;
}) {
  const dotStyle = useAnimatedStyle<ViewStyle>(() => {
    const diff = (scrollX.value - pageIndex * snap) / snap;
    return {
      backgroundColor: interpolateColor(
        Math.min(Math.abs(diff), 1),
        [0, 1],
        [color, inactiveColor],
      ),
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

/** The tappable, fully-legible quote card. Blurs over its own content when not centered. */
function QuoteCard({
  quote,
  color,
  theme,
  scheme,
  selected,
  blurStyle,
  onPress,
}: {
  quote: Quote;
  color: string;
  theme: ReturnType<typeof useTheme>;
  scheme: 'light' | 'dark';
  selected: boolean;
  blurStyle?: AnimatedStyle<ViewStyle>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: selected ? color : 'transparent',
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <LinearGradient
        colors={[`${color}33`, `${color}00`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ThemedText style={[styles.cardMark, { color }]}>&ldquo;</ThemedText>
      <ThemedText style={[styles.cardText, cardTextSizeStyle(quote.text.length)]}>
        {quote.text}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.cardAuthor}>
        — {quote.author}
      </ThemedText>
      {selected && (
        <View style={[styles.cardBadge, { backgroundColor: color }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
      {blurStyle && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, blurStyle]}>
          <BlurView intensity={24} tint={scheme} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </Pressable>
  );
}

/**
 * Quote length varies wildly (13–275 chars across `quotes.ts`). Rather than
 * truncating long quotes, shrink the font in tiers so they stay legible and
 * reasonably contained instead of blowing up the card's height.
 */
function cardTextSizeStyle(length: number): { fontSize: number; lineHeight: number } {
  if (length <= 60) return { fontSize: 18, lineHeight: 25 };
  if (length <= 130) return { fontSize: 16, lineHeight: 22 };
  if (length <= 200) return { fontSize: 14, lineHeight: 20 };
  return { fontSize: 12, lineHeight: 17 };
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three },
  stage: { marginHorizontal: -Spacing.four },
  pager: { flexGrow: 0 },
  page: { gap: Spacing.three, marginRight: PAGE_GAP },
  card: {
    borderRadius: Spacing.four,
    borderWidth: 2,
    padding: Spacing.four,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  cardBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMark: {
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: -4,
    opacity: 0.9,
  },
  cardText: { fontSize: 16, lineHeight: 22, fontStyle: 'italic', marginBottom: Spacing.two },
  cardAuthor: { textAlign: 'right' },
  dotsRow: { flexDirection: 'row', gap: Spacing.one, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
