import styled from 'styled-components/native';
import LottieView from 'lottie-react-native';
import SpinnerCar from '../../assets/lottie/loading-drift.json';

export const CarSpinner = styled(LottieView).attrs({
	autoPlay: true,
	loop: true,
	source: SpinnerCar,
})`
	height: ${({ size }) => size ?? 60}px;
`;

export const Container = styled.View`
	width: 100%;
	justify-content: center;
	align-items: center;
`;
