## Redis Desktop Client
RedisDesktopClient是一款颜值较高、使用方便的redis客户端工具，可以使用该工具对redis进行新增key-value，修改key-value，删除key，修改key有效时间，同时也支持展示当前redis的详细信息，例如使用了多少内存，是否是单机模式等。该工具目前支持string，hash，list，set，zset五种数据类型。

**RedisDesktopClient的ui完全是自己设计，没有仿照RedisDesktopManager，也没有仿照AnotherRedisDesktopManager，如果大家对ui或者交互上有建议，我也会根据情况采纳**

 **由于是第一个版本，可能还有很多问题，如果有问题希望大家直接提issue就好，我会随时关注，并及时处理** 
## 功能
+ **支持Cluster模式**，目前只支持局域网内连接。SSH方式暂不支持
+ 支持ip端口号方式访问
+ 支持SSH代理方式访问
+ 支持key根据分号（:）分组展示，为了保证运行速度，默认展示前10000条数据，看不到的数据可以通过搜索查询
+ 支持选择几个key一起删除
+ 支持清空某个db下的所有key
+ 支持string，list，set，zset，map 五种数据类型
+ 支持查看redis运行信息和配置信息

## TODO
+ 界面优化

## 注意
**如果发现key是乱码，请检查是否讲序列化之后的可以存到redis里，建议修改插入方式。**  
java请参考：https://blog.csdn.net/hong10086/article/details/88864402

## 目前存在的问题（暂时无法解决）
+ java序列化的key无法正常显示（Java直接使用redisTemplate.opsForValue().set("allStudents","studentList");就无法显示），
该bug是ioredis存在的bug（最新反馈，并不打算修复这个问题，https://github.com/luin/ioredis/issues/1099）

## 承诺

**本项目承诺长期维护，bug及时修复**

## 意见征集
+ 是否需要增加命令行模式？
+ ttl是否要转化为时分秒的方式，比较直接
+ 是否需要增加连接信息导出的功能？方便两台电脑同步
+ key值列表是否需要增加分页？或者是只显示多少条，其他的通过搜索查找

## 采用的技术
+ [Electron](https://github.com/electron/electron)
+ [Vue](https://github.com/vuejs/vue)
+ [element](https://github.com/ElemeFE/element)
+ [ioredis](https://github.com/luin/ioredis)

## Windows安装包下载地址
最新版exe安装包地址
[release](https://gitee.com/hedavid/redis-desktop-client/releases)

## macOS安装包下载地址
最新版dmg安装包地址
[release](https://gitee.com/hedavid/redis-desktop-client/releases) 

## TODO
+ 加入深色模式
+ 增加cluster模式

## 交流群
QQ: 285636893

## 屏幕截图
 ![avatar](screenshot/redis1.png)
 ![avatar](screenshot/redis0.png)
 ![avatar](screenshot/redis2.png)
 ![avatar](screenshot/redis3.png)
 ![avatar](screenshot/redis4.png)
