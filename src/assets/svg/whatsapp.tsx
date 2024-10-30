import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const WhatsappIcon = () => {
  return (
    <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
      <Path
        d="M50 11.375C49.9719 10.2964 49.8885 9.22001 49.75 8.15C49.5633 7.21281 49.2522 6.30477 48.825 5.45C48.3782 4.52276 47.7781 3.67757 47.05 2.95C46.3152 2.23051 45.4715 1.63148 44.55 1.175C43.6941 0.756111 42.7861 0.453434 41.85 0.275C40.7902 0.116248 39.7214 0.0244002 38.65 0H11.375C10.2964 0.028091 9.22001 0.111534 8.15 0.25C7.21281 0.436671 6.30477 0.747758 5.45 1.175C4.52276 1.62184 3.67757 2.22193 2.95 2.95C2.23051 3.68478 1.63148 4.52849 1.175 5.45C0.756111 6.30591 0.453434 7.21394 0.275 8.15C0.116248 9.20984 0.0244002 10.2786 0 11.35V38.625C0.028091 39.7036 0.111534 40.78 0.25 41.85C0.436671 42.7872 0.747758 43.6952 1.175 44.55C1.62184 45.4772 2.22193 46.3224 2.95 47.05C3.68478 47.7695 4.52849 48.3685 5.45 48.825C6.30591 49.2439 7.21394 49.5466 8.15 49.725C9.20984 49.8837 10.2786 49.9756 11.35 50H38.625C39.7036 49.9719 40.78 49.8885 41.85 49.75C42.7872 49.5633 43.6952 49.2522 44.55 48.825C45.4772 48.3782 46.3224 47.7781 47.05 47.05C47.7695 46.3152 48.3685 45.4715 48.825 44.55C49.2439 43.6941 49.5466 42.7861 49.725 41.85C49.8837 40.7902 49.9756 39.7214 50 38.65V11.375ZM25.575 42.5C22.5727 42.4852 19.6228 41.7112 17 40.25L7.5 42.75L10 33.45C8.38778 30.7411 7.52496 27.6522 7.5 24.5C7.50995 20.9573 8.56801 17.4968 10.5409 14.5543C12.5138 11.6117 15.3133 9.31883 18.5868 7.96429C21.8603 6.60975 25.4615 6.25418 28.9367 6.94235C32.4119 7.63052 35.6058 9.33165 38.1161 11.8315C40.6263 14.3314 42.3408 17.5181 43.0434 20.9905C43.746 24.4628 43.4054 28.0654 42.0645 31.3445C40.7236 34.6236 38.4423 37.4327 35.508 39.4178C32.5737 41.4029 29.1176 42.4753 25.575 42.5V42.5ZM25.575 9.675C22.9245 9.70533 20.3294 10.4375 18.0539 11.7968C15.7784 13.1562 13.9037 15.0943 12.6207 17.4138C11.3378 19.7333 10.6924 22.3513 10.7502 25.0013C10.808 27.6513 11.5671 30.2387 12.95 32.5L13.3 33.075L11.8 38.55L17.5 37L18.05 37.325C20.3239 38.6644 22.911 39.3801 25.55 39.4C29.5282 39.4 33.3436 37.8196 36.1566 35.0066C38.9696 32.1936 40.55 28.3782 40.55 24.4C40.55 20.4218 38.9696 16.6064 36.1566 13.7934C33.3436 10.9804 29.5282 9.4 25.55 9.4L25.575 9.675ZM34.325 30.975C33.9976 31.5212 33.5591 31.9925 33.038 32.3586C32.517 32.7246 31.9248 32.9772 31.3 33.1C30.3663 33.2707 29.4051 33.2106 28.5 32.925C27.6484 32.6587 26.8135 32.3415 26 31.975C22.9094 30.4242 20.2736 28.0985 18.35 25.225C17.3047 23.8937 16.6705 22.2864 16.525 20.6C16.5101 19.8995 16.6426 19.2036 16.914 18.5576C17.1853 17.9116 17.5894 17.3298 18.1 16.85C18.2504 16.6795 18.4349 16.5424 18.6416 16.4477C18.8483 16.3529 19.0726 16.3026 19.3 16.3H20C20.275 16.3 20.65 16.3 21 17.075C21.35 17.85 22.275 20.175 22.4 20.4C22.4614 20.5199 22.4935 20.6527 22.4935 20.7875C22.4935 20.9222 22.4614 21.0551 22.4 21.175C22.2895 21.4467 22.1377 21.6996 21.95 21.925C21.725 22.2 21.475 22.525 21.275 22.725C21.075 22.925 20.825 23.175 21.075 23.625C21.7552 24.773 22.5972 25.817 23.575 26.725C24.6398 27.6659 25.8573 28.4183 27.175 28.95C27.625 29.175 27.9 29.15 28.15 28.95C28.4 28.75 29.275 27.65 29.575 27.2C29.875 26.75 30.175 26.825 30.575 26.975C30.975 27.125 33.2 28.2 33.65 28.425C34.1 28.65 34.375 28.75 34.5 28.95C34.6084 29.6043 34.5482 30.2755 34.325 30.9V30.975Z"
        fill="#28EF4C"
      />
    </Svg>
  );
};