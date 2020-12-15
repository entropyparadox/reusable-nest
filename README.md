# reusable-nest

Martian 팀의 NestJS 프로젝트에 재활용 가능한 모듈 및 유틸리티들을 모아둔 라이브러리 입니다.

## Table of Contents

- [Getting Started](#getting-started)

## Getting Started

### 프로젝트 생성

1. GitHub 에 빈 리포지토리를 생성하고 로컬에 클론 받는다.

2. 해당 디렉토리 내에서 nest 프로젝트를 생성한다.

```
$ npm i -g @nestjs/cli
$ nest new project-name
```

### Configuration

1. 다음 명령어를 입력해 필요한 패키지를 설치한다.

```
npm i @nestjs/config typeorm-naming-strategies
```

2. `src/main.ts` 파일의 `await app.listen(3000);` 부분을 다음 코드로 교체해준다.

```
await app.listen(process.env.PORT || 8000);
```

3. `src/app.module.ts` 파일에 다음 내용을 추가한다.

```
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        // dropSchema: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    // ...
  ],
  // ...
})
export class AppModule {}
```

4. 프로젝트 루트 경로에 `.env` 와 `.env.example` 파일을 생성하고 둘 다 다음 내용으로 채워준다.

```
# common
PORT=8000

# datasource
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=my_project
DB_PASSWORD=asdf
DB_DATABASE=my_project
```

5. `.gitignore` 파일에 다음 내용을 추가한다.

```
.env
```

### Database

1. 다음 명령어를 입력해서 컨테이너 이름은 `pg` 유저는 `postgres` 패스워드는 `asdf` 인 Docker 컨테이너를 실행한다.

```
docker run --name pg -e POSTGRES_PASSWORD=asdf -e POSTGRES_DB=my_project -e POSTGRES_USER=my_project -p 5432:5432 -d postgres
```

2. 다음 명령어를 입력해서 방금 생성한 `pg` 컨테이너에 `psql` 로 접속할 수 있다.

```
docker exec -it pg psql -U postgres
```

3. (Optional) 기타 `psql` 명령어들

   - `create database my_project;` - my_project DB 생성
   - `\l` - 모든 데이터베이스 나열하기
   - `\c my_project` - 이름이 `my_project` 인 데이터베이스에 연결 (특정 데이터베이스에 대해 작업하기 위해 연결함)
   - `\dt` - 연결한 데이터베이스의 모든 테이블 나열하기
   - `\q` - `psql` 종료
